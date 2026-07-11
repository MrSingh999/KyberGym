import { PersonalWorkoutRepository } from './personalWorkout.repository.js';
import { MemberRepository } from '../member/member.repository.js';
import createError from 'http-errors';

export class PersonalWorkoutService {
  static async createWorkout(gymId, userId, data) {
    // Verify member exists
    const member = await MemberRepository.findById(data.memberId, gymId);
    if (!member) throw createError.NotFound('Member not found');

    return PersonalWorkoutRepository.create({
      ...data,
      gymId,
      createdBy: userId
    });
  }

  static async getWorkouts(gymId, query) {
    const { page = 1, limit = 10, memberId, search } = query;
    const filter = {};

    if (memberId) filter.memberId = memberId;
    if (search) filter.title = { $regex: search, $options: 'i' };

    return PersonalWorkoutRepository.findPaginated(gymId, filter, Number(page), Number(limit));
  }

  static async getWorkoutById(id, gymId) {
    const workout = await PersonalWorkoutRepository.findById(id, gymId);
    if (!workout) throw createError.NotFound('Personal workout not found');
    return workout;
  }

  static async updateWorkout(id, gymId, data) {
    const workout = await PersonalWorkoutRepository.update(id, gymId, data);
    if (!workout) throw createError.NotFound('Personal workout not found');
    return workout;
  }

  static async deleteWorkout(id, gymId) {
    const workout = await PersonalWorkoutRepository.delete(id, gymId);
    if (!workout) throw createError.NotFound('Personal workout not found');
    return workout;
  }
}
