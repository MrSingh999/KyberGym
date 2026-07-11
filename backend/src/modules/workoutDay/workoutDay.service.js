import { WorkoutDayRepository } from './workoutDay.repository.js';
import { WorkoutTemplateRepository } from '../workoutTemplate/workoutTemplate.repository.js';
import createError from 'http-errors';

export class WorkoutDayService {
  static async createDay(gymId, data) {
    const template = await WorkoutTemplateRepository.findById(data.workoutTemplateId, gymId);
    if (!template) {
      throw createError.NotFound('Workout template not found');
    }

    try {
      return await WorkoutDayRepository.create({ ...data, gymId });
    } catch (error) {
      if (error.code === 11000) {
        throw createError.Conflict('A workout day with this day number already exists for this template');
      }
      throw error;
    }
  }

  static async getDaysByTemplate(gymId, templateId) {
    return WorkoutDayRepository.findByTemplateId(templateId, gymId);
  }

  static async getDayById(id, gymId) {
    const day = await WorkoutDayRepository.findById(id, gymId);
    if (!day) throw createError.NotFound('Workout day not found');
    return day;
  }

  static async updateDay(id, gymId, data) {
    try {
      const day = await WorkoutDayRepository.update(id, gymId, data);
      if (!day) throw createError.NotFound('Workout day not found');
      return day;
    } catch (error) {
      if (error.code === 11000) {
        throw createError.Conflict('A workout day with this day number already exists for this template');
      }
      throw error;
    }
  }

  static async deleteDay(id, gymId) {
    const day = await WorkoutDayRepository.delete(id, gymId);
    if (!day) throw createError.NotFound('Workout day not found');
    return day;
  }
}
