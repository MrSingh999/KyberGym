import createError from 'http-errors';
import mongoose from 'mongoose';
import { WorkoutRepository } from './workout.repository.js';
import { WorkoutDay } from '../workoutDay/models/WorkoutDay.model.js';
import { MemberRepository } from '../member/member.repository.js';
import { Member } from '../member/models/Member.model.js';

export class WorkoutService {
  /**
   * Create a new workout for a gym.
   */
  static async createWorkout(gymId, userId, data) {
    // If assignedMembers are passed as publicIds, resolve them to ObjectIds
    const resolvedData = { ...data };
    if (data.assignedMembers && Array.isArray(data.assignedMembers)) {
      const members = await Member.find({
        publicId: { $in: data.assignedMembers },
        gymId
      }).select('_id');
      resolvedData.assignedMembers = members.map(m => m._id);
    }

    return WorkoutRepository.create({
      gymId,
      createdBy: userId,
      ...resolvedData,
    });
  }

  /**
   * List all workouts for a gym (optionally filter by active status).
   */
  static async getWorkouts(gymId, query = {}) {
    const filter = {};
    if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
    return WorkoutRepository.findAll(gymId, filter);
  }

  /**
   * Get a single workout with its workout days.
   */
  static async getWorkoutById(id, gymId) {
    const workout = await WorkoutRepository.findById(id, gymId);
    if (!workout) throw createError.NotFound('Workout not found');

    const days = await WorkoutDay.find({ workoutId: workout._id }).sort({ dayNumber: 1 });

    return { ...workout.toObject(), days };
  }

  /**
   * Update a workout's metadata or assignment.
   */
  static async updateWorkout(id, gymId, data) {
    const resolvedData = { ...data };
    if (data.assignedMembers && Array.isArray(data.assignedMembers)) {
      const members = await Member.find({
        publicId: { $in: data.assignedMembers },
        gymId
      }).select('_id');
      resolvedData.assignedMembers = members.map(m => m._id);
    }

    const workout = await WorkoutRepository.update(id, gymId, resolvedData);
    if (!workout) throw createError.NotFound('Workout not found');
    return workout;
  }

  /**
   * Deactivate (soft-delete) a workout.
   */
  static async deleteWorkout(id, gymId) {
    const workout = await WorkoutRepository.deactivate(id, gymId);
    if (!workout) throw createError.NotFound('Workout not found');
    return workout;
  }

  /**
   * Get all workouts assigned to a specific member.
   * Includes workout days for each workout.
   */
  static async getWorkoutsForMember(gymId, memberId) {
    const member = await MemberRepository.findById(memberId, gymId);
    if (!member) throw createError.NotFound('Member not found');

    const workouts = await WorkoutRepository.findForMember(gymId, member._id);

    // Attach days to each workout
    const workoutIds = workouts.map((w) => w._id);
    const allDays = await WorkoutDay.find({ workoutId: { $in: workoutIds } }).sort({ dayNumber: 1 });

    return workouts.map((workout) => ({
      ...workout.toObject(),
      days: allDays.filter((d) => d.workoutId.toString() === workout._id.toString()),
    }));
  }
}
