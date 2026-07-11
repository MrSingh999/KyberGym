import { WorkoutTemplateRepository } from './workoutTemplate.repository.js';
import createError from 'http-errors';

export class WorkoutTemplateService {
  static async createTemplate(gymId, userId, data) {
    return WorkoutTemplateRepository.create({
      ...data,
      gymId,
      createdBy: userId
    });
  }

  static async getTemplates(gymId, query) {
    const { page = 1, limit = 10, search, goal, difficulty, active } = query;
    const filter = {};

    if (goal) filter.goal = goal;
    if (difficulty) filter.difficulty = difficulty;
    if (active !== undefined) filter.active = active === 'true';

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    return WorkoutTemplateRepository.findPaginated(gymId, filter, Number(page), Number(limit));
  }

  static async getTemplateById(id, gymId) {
    const template = await WorkoutTemplateRepository.findById(id, gymId);
    if (!template) throw createError.NotFound('Workout template not found');
    return template;
  }

  static async updateTemplate(id, gymId, data) {
    const template = await WorkoutTemplateRepository.update(id, gymId, data);
    if (!template) throw createError.NotFound('Workout template not found');
    return template;
  }

  static async deleteTemplate(id, gymId) {
    const template = await WorkoutTemplateRepository.delete(id, gymId);
    if (!template) throw createError.NotFound('Workout template not found');
    return template;
  }
}
