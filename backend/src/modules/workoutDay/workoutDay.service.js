import createError from 'http-errors';
import mongoose from 'mongoose';
import { WorkoutDayRepository } from './workoutDay.repository.js';
import { WorkoutRepository } from '../workouts/workout.repository.js';
import { assertWorkoutOwnership } from '../workouts/workout.auth.js';

export class WorkoutDayService {
  /**
   * Create a day inside a workout.
   * Validates that the parent workout exists and belongs to the gym.
   */
  static async createDay(gymId, workoutId, data, user) {
    const workout = await WorkoutRepository.findById(workoutId, gymId);
    if (!workout) throw createError.NotFound('Workout not found');

    assertWorkoutOwnership(workout, user);

    try {
      return await WorkoutDayRepository.create({ workoutId: workout._id, ...data });
    } catch (error) {
      if (error.code === 11000) {
        throw createError.Conflict(`Day with order index ${data.orderIndex} already exists for this workout`);
      }
      throw error;
    }
  }

  static async getDaysByWorkout(workoutId, gymId, _user) {
    const workout = await WorkoutRepository.findById(workoutId, gymId);
    if (!workout) throw createError.NotFound('Workout not found');
    return WorkoutDayRepository.findByWorkoutId(workout._id);
  }

  static async getDayById(id, workoutId, gymId) {
    const workout = await WorkoutRepository.findById(workoutId, gymId);
    if (!workout) throw createError.NotFound('Workout not found');

    const day = await WorkoutDayRepository.findById(id, workout._id);
    if (!day) throw createError.NotFound('Workout day not found');
    return day;
  }

  static async updateDay(id, workoutId, gymId, data, user) {
    const workout = await WorkoutRepository.findById(workoutId, gymId);
    if (!workout) throw createError.NotFound('Workout not found');

    assertWorkoutOwnership(workout, user);

    try {
      const day = await WorkoutDayRepository.update(id, workout._id, data);
      if (!day) throw createError.NotFound('Workout day not found');
      return day;
    } catch (error) {
      if (error.code === 11000) {
        throw createError.Conflict(`Day with order index ${data.orderIndex} already exists for this workout`);
      }
      throw error;
    }
  }

  static async deleteDay(id, workoutId, gymId, user) {
    const workout = await WorkoutRepository.findById(workoutId, gymId);
    if (!workout) throw createError.NotFound('Workout not found');

    assertWorkoutOwnership(workout, user);

    const day = await WorkoutDayRepository.delete(id, workout._id);
    if (!day) throw createError.NotFound('Workout day not found');
    return day;
  }
}
