import createError from 'http-errors';
import mongoose from 'mongoose';
import { Workout } from '../workouts/models/Workout.model.js';
import { Member } from '../member/models/Member.model.js';
import { WorkoutAssignmentRepository } from './workoutAssignment.repository.js';

export class WorkoutAssignmentService {
  static async assignWorkout(gymId, userId, data) {
    const { workoutId, memberIds, assignmentType, startDate, endDate } = data;

    const workout = await Workout.findOne({ _id: workoutId, gymId, isDeleted: false });
    if (!workout) throw createError.NotFound('Workout not found');
    if (workout.status !== 'ACTIVE') throw createError.BadRequest('Workout must be ACTIVE to assign');

    let targetMemberIds = [];

    if (assignmentType === 'ALL') {
      const activeMembers = await Member.find({ gymId, status: 'active', isDeleted: { $ne: true } }).select('_id');
      targetMemberIds = activeMembers.map(m => m._id);
    } else if (assignmentType === 'SELECTED') {
      if (!memberIds || memberIds.length === 0) {
        throw createError.BadRequest('At least one member must be selected');
      }
      const members = await Member.find({
        _id: { $in: memberIds },
        gymId,
        status: 'active',
        isDeleted: { $ne: true },
      }).select('_id');
      if (members.length !== memberIds.length) {
        throw createError.BadRequest('One or more members not found or not active');
      }
      targetMemberIds = members.map(m => m._id);
    } else {
      throw createError.BadRequest('Invalid assignmentType. Use ALL or SELECTED');
    }

    if (targetMemberIds.length === 0) {
      throw createError.BadRequest('No active members to assign');
    }

    const existing = await WorkoutAssignmentRepository.findActiveByWorkoutAndMembers(gymId, workout._id, targetMemberIds);
    const assignedSet = new Set(existing.map(a => a.memberId.toString()));

    const toCreate = [];
    let skipped = 0;

    for (const memberId of targetMemberIds) {
      if (assignedSet.has(memberId.toString())) {
        skipped++;
      } else {
        toCreate.push({
          gymId,
          workoutId: workout._id,
          memberId,
          assignedBy: userId,
          assignedAt: new Date(),
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          status: 'ACTIVE',
        });
      }
    }

    let created = [];
    if (toCreate.length > 0) {
      created = await WorkoutAssignmentRepository.bulkCreate(toCreate);
    }

    return {
      assigned: created.length,
      skipped,
      failed: 0,
    };
  }

  static async getAssignments(gymId, query) {
    return WorkoutAssignmentRepository.findAll(gymId, query);
  }

  static async getAssignmentById(id, gymId) {
    const assignment = await WorkoutAssignmentRepository.findById(id, gymId);
    if (!assignment) throw createError.NotFound('Assignment not found');
    return assignment;
  }

  static async updateAssignment(id, gymId, userId, data) {
    const assignment = await WorkoutAssignmentRepository.findById(id, gymId);
    if (!assignment) throw createError.NotFound('Assignment not found');

    const allowedFields = {};
    if (data.startDate !== undefined) allowedFields.startDate = data.startDate;
    if (data.endDate !== undefined) allowedFields.endDate = data.endDate;
    if (data.status !== undefined) allowedFields.status = data.status;

    if (Object.keys(allowedFields).length === 0) {
      throw createError.BadRequest('No valid fields to update');
    }

    return WorkoutAssignmentRepository.update(id, gymId, allowedFields);
  }

  static async removeAssignment(id, gymId, userId) {
    const assignment = await WorkoutAssignmentRepository.findById(id, gymId);
    if (!assignment) throw createError.NotFound('Assignment not found');

    return WorkoutAssignmentRepository.softRemove(id, gymId, userId);
  }

  static async getMemberAssignments(gymId, memberId) {
    const member = await Member.findOne({ _id: memberId, gymId });
    if (!member) throw createError.NotFound('Member not found');

    return WorkoutAssignmentRepository.findActiveByMember(gymId, member._id);
  }
}
