import createError from 'http-errors';
import { WorkoutRepository } from './workout.repository.js';
import { WorkoutDay } from '../workoutDay/models/WorkoutDay.model.js';

export class WorkoutService {
  /**
   * Create a new workout for a gym.
   */
  static async createWorkout(gymId, userId, data) {
    return WorkoutRepository.create({
      gymId,
      createdBy: userId,
      ...data,
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

    const days = await WorkoutDay.find({ workoutId: id }).sort({ dayNumber: 1 });

    return { ...workout.toObject(), days };
  }

  /**
   * Update a workout's metadata or assignment.
   */
  static async updateWorkout(id, gymId, data) {
    const workout = await WorkoutRepository.update(id, gymId, data);
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
    const workouts = await WorkoutRepository.findForMember(gymId, memberId);

    // Attach days to each workout
    const workoutIds = workouts.map((w) => w._id);
    const allDays = await WorkoutDay.find({ workoutId: { $in: workoutIds } }).sort({ dayNumber: 1 });

    return workouts.map((workout) => ({
      ...workout.toObject(),
      days: allDays.filter((d) => d.workoutId.toString() === workout._id.toString()),
    }));
  }
}
