import { WorkoutService } from './workout.service.js';
import { WorkoutDayService } from '../workoutDay/workoutDay.service.js';
import { ApiResponse } from '../../shared/ApiResponse.js';
import httpStatus from 'http-status';

export class WorkoutController {
  // ── Workouts ──────────────────────────────────────────────

  static async createWorkout(req, res) {
    const gymId = req.gym._id;
    const userId = req.user._id;
    const workout = await WorkoutService.createWorkout(gymId, userId, req.body);
    return ApiResponse.success(res, httpStatus.CREATED, 'Workout created', workout);
  }

  static async getWorkouts(req, res) {
    const gymId = req.gym._id;
    const workouts = await WorkoutService.getWorkouts(gymId, req.query);
    return ApiResponse.success(res, httpStatus.OK, 'Workouts retrieved', workouts);
  }

  static async getWorkoutById(req, res) {
    const gymId = req.gym._id;
    const workout = await WorkoutService.getWorkoutById(req.params.id, gymId);
    return ApiResponse.success(res, httpStatus.OK, 'Workout retrieved', workout);
  }

  static async updateWorkout(req, res) {
    const gymId = req.gym._id;
    const workout = await WorkoutService.updateWorkout(req.params.id, gymId, req.body);
    return ApiResponse.success(res, httpStatus.OK, 'Workout updated', workout);
  }

  static async deleteWorkout(req, res) {
    const gymId = req.gym._id;
    await WorkoutService.deleteWorkout(req.params.id, gymId);
    return ApiResponse.success(res, httpStatus.OK, 'Workout deactivated');
  }

  // ── Workout Days (sub-resource) ────────────────────────────

  static async createDay(req, res) {
    const gymId = req.gym._id;
    const workoutId = req.params.id;
    const day = await WorkoutDayService.createDay(gymId, workoutId, req.body);
    return ApiResponse.success(res, httpStatus.CREATED, 'Workout day added', day);
  }

  static async updateDay(req, res) {
    const gymId = req.gym._id;
    const workoutId = req.params.id;
    const dayId = req.params.dayId;
    const day = await WorkoutDayService.updateDay(dayId, workoutId, gymId, req.body);
    return ApiResponse.success(res, httpStatus.OK, 'Workout day updated', day);
  }

  static async deleteDay(req, res) {
    const gymId = req.gym._id;
    const workoutId = req.params.id;
    const dayId = req.params.dayId;
    await WorkoutDayService.deleteDay(dayId, workoutId, gymId);
    return ApiResponse.success(res, httpStatus.OK, 'Workout day removed');
  }
}
