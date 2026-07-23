import { WorkoutService } from './workout.service.js';
import { WorkoutDayService } from '../workoutDay/workoutDay.service.js';
import { ApiSuccess } from '../../shared/ApiSuccess.js';
import httpStatus from 'http-status';

export class WorkoutController {
  static async createWorkout(req, res) {
    const gymId = req.gym._id;
    const workout = await WorkoutService.createWorkout(gymId, req.user, req.body);
    return ApiSuccess.send(res, httpStatus.CREATED, 'Workout created', workout);
  }

  static async getWorkouts(req, res) {
    const gymId = req.gym._id;
    const workouts = await WorkoutService.getWorkouts(gymId, req.query, req.user);
    return ApiSuccess.send(res, httpStatus.OK, 'Workouts retrieved', workouts);
  }

  static async getWorkoutById(req, res) {
    const gymId = req.gym._id;
    const workout = await WorkoutService.getWorkoutById(req.params.id, gymId, req.user);
    return ApiSuccess.send(res, httpStatus.OK, 'Workout retrieved', workout);
  }

  static async updateWorkout(req, res) {
    const gymId = req.gym._id;
    const workout = await WorkoutService.updateWorkout(req.params.id, gymId, req.body, req.user);
    return ApiSuccess.send(res, httpStatus.OK, 'Workout updated', workout);
  }

  static async deleteWorkout(req, res) {
    const gymId = req.gym._id;
    await WorkoutService.deleteWorkout(req.params.id, gymId, req.user);
    return ApiSuccess.send(res, httpStatus.OK, 'Workout deleted');
  }

  static async duplicateWorkout(req, res) {
    const gymId = req.gym._id;
    const workout = await WorkoutService.duplicateWorkout(req.params.id, gymId, req.user._id, req.user);
    return ApiSuccess.send(res, httpStatus.CREATED, 'Workout duplicated', workout);
  }

  static async archiveWorkout(req, res) {
    const gymId = req.gym._id;
    const workout = await WorkoutService.archiveWorkout(req.params.id, gymId, req.user);
    return ApiSuccess.send(res, httpStatus.OK, 'Workout archived', workout);
  }

  static async saveNested(req, res) {
    const gymId = req.gym._id;
    const workout = await WorkoutService.saveNested(gymId, req.params.id, req.body, req.user);
    return ApiSuccess.send(res, httpStatus.OK, 'Workout saved with days', workout);
  }

  static async createDay(req, res) {
    const gymId = req.gym._id;
    const day = await WorkoutDayService.createDay(gymId, req.params.id, req.body, req.user);
    return ApiSuccess.send(res, httpStatus.CREATED, 'Workout day added', day);
  }

  static async updateDay(req, res) {
    const gymId = req.gym._id;
    const day = await WorkoutDayService.updateDay(req.params.dayId, req.params.id, gymId, req.body, req.user);
    return ApiSuccess.send(res, httpStatus.OK, 'Workout day updated', day);
  }

  static async deleteDay(req, res) {
    const gymId = req.gym._id;
    await WorkoutDayService.deleteDay(req.params.dayId, req.params.id, gymId, req.user);
    return ApiSuccess.send(res, httpStatus.OK, 'Workout day removed');
  }
}
