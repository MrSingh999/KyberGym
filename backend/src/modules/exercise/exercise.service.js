import { ExerciseRepository } from './exercise.repository.js';
import createError from 'http-errors';

export class ExerciseService {
  static async createExercise(gymId, userId, data) {
    return ExerciseRepository.create({
      ...data,
      gymId,
      createdBy: userId
    });
  }

  static async getExercises(gymId, query) {
    const { page = 1, limit = 10, search, muscleGroup, difficulty } = query;
    const filter = {};

    if (muscleGroup) filter.muscleGroup = muscleGroup;
    if (difficulty) filter.difficulty = difficulty;
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { equipment: { $regex: search, $options: 'i' } }
      ];
    }

    return ExerciseRepository.findPaginated(gymId, filter, Number(page), Number(limit));
  }

  static async getExerciseById(id, gymId) {
    const exercise = await ExerciseRepository.findById(id, gymId);
    if (!exercise) throw createError.NotFound('Exercise not found');
    return exercise;
  }

  static async updateExercise(id, gymId, data) {
    const exercise = await ExerciseRepository.update(id, gymId, data);
    if (!exercise) throw createError.NotFound('Exercise not found');
    return exercise;
  }

  static async deleteExercise(id, gymId) {
    const exercise = await ExerciseRepository.delete(id, gymId);
    if (!exercise) throw createError.NotFound('Exercise not found');
    return exercise;
  }
}
