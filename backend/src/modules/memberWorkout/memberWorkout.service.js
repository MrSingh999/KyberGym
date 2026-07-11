import { MemberWorkoutRepository } from './memberWorkout.repository.js';
import { WorkoutTemplateRepository } from '../workoutTemplate/workoutTemplate.repository.js';
import { MemberRepository } from '../member/member.repository.js';
import createError from 'http-errors';
import { addDays } from 'date-fns';

export class MemberWorkoutService {
  static async assignWorkout(gymId, userId, data) {
    // Verify member
    const member = await MemberRepository.findById(data.memberId, gymId);
    if (!member) throw createError.NotFound('Member not found');

    // Verify template
    const template = await WorkoutTemplateRepository.findById(data.workoutTemplateId, gymId);
    if (!template) throw createError.NotFound('Workout template not found');

    // Check if member already has an active workout
    const activeWorkout = await MemberWorkoutRepository.findActiveForMember(data.memberId, gymId);
    if (activeWorkout) {
      throw createError.Conflict('Member already has an active workout plan. Please complete or cancel it first.');
    }

    const startDate = new Date(data.startDate);
    const endDate = addDays(startDate, template.durationWeeks * 7);

    return MemberWorkoutRepository.create({
      ...data,
      gymId,
      endDate,
      assignedBy: userId,
      status: 'active'
    });
  }

  static async getWorkouts(gymId, query) {
    const { page = 1, limit = 10, memberId, status } = query;
    const filter = {};

    if (memberId) filter.memberId = memberId;
    if (status) filter.status = status;

    return MemberWorkoutRepository.findPaginated(gymId, filter, Number(page), Number(limit));
  }

  static async getWorkoutById(id, gymId) {
    const workout = await MemberWorkoutRepository.findById(id, gymId);
    if (!workout) throw createError.NotFound('Member workout not found');
    return workout;
  }

  static async updateStatus(id, gymId, data) {
    const workout = await MemberWorkoutRepository.update(id, gymId, data);
    if (!workout) throw createError.NotFound('Member workout not found');
    return workout;
  }
}
