import createError from 'http-errors';
import { WorkoutDayRepository } from './workoutDay.repository.js';
import { WorkoutRepository } from '../workouts/workout.repository.js';

export class WorkoutDayService {
  /**
   * Create a day inside a workout.
   * Validates that the parent workout exists and belongs to the gym.
   */
  static async createDay(gymId, workoutId, data) {
    const workout = await WorkoutRepository.findById(workoutId, gymId);
    if (!workout) throw createError.NotFound('Workout not found');

    try {
      return await WorkoutDayRepository.create({ workoutId, ...data });
    } catch (error) {
      if (error.code === 11000) {
        throw createError.Conflict(`Day ${data.dayNumber} already exists for this workout`);
      }
      throw error;
    }
  }

  static async getDaysByWorkout(workoutId, gymId) {
    // Validate workout belongs to gym
    const workout = await WorkoutRepository.findById(workoutId, gymId);
    if (!workout) throw createError.NotFound('Workout not found');
    return WorkoutDayRepository.findByWorkoutId(workoutId);
  }

  static async getDayById(id, workoutId, gymId) {
    const workout = await WorkoutRepository.findById(workoutId, gymId);
    if (!workout) throw createError.NotFound('Workout not found');

    const day = await WorkoutDayRepository.findById(id, workoutId);
    if (!day) throw createError.NotFound('Workout day not found');
    return day;
  }

  static async updateDay(id, workoutId, gymId, data) {
    const workout = await WorkoutRepository.findById(workoutId, gymId);
    if (!workout) throw createError.NotFound('Workout not found');

    try {
      const day = await WorkoutDayRepository.update(id, workoutId, data);
      if (!day) throw createError.NotFound('Workout day not found');
      return day;
    } catch (error) {
      if (error.code === 11000) {
        throw createError.Conflict(`Day ${data.dayNumber} already exists for this workout`);
      }
      throw error;
    }
  }

  static async deleteDay(id, workoutId, gymId) {
    const workout = await WorkoutRepository.findById(workoutId, gymId);
    if (!workout) throw createError.NotFound('Workout not found');

    const day = await WorkoutDayRepository.delete(id, workoutId);
    if (!day) throw createError.NotFound('Workout day not found');
    return day;
  }
}
