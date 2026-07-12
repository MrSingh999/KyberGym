import { ExerciseService } from './exercise.service.js';
import { ApiResponse } from '../../shared/ApiResponse.js';
import httpStatus from 'http-status';

export class ExerciseController {
  
  static async createExercise(req, res) {
    const gymId = req.gym._id;
    const userId = req.user._id;
    
    const exercise = await ExerciseService.createExercise(gymId, userId, req.body);
    return ApiResponse.success(res, httpStatus.CREATED, 'Exercise created successfully', exercise);
  }

  static async getExercises(req, res) {
    const gymId = req.gym._id;
    const result = await ExerciseService.getExercises(gymId, req.query);
    
    return res.status(httpStatus.OK).json({
      success: true,
      message: 'Exercises retrieved successfully',
      data: result.data,
      meta: result.meta
    });
  }

  static async getExerciseById(req, res) {
    const gymId = req.gym._id;
    const { id } = req.params;
    
    const exercise = await ExerciseService.getExerciseById(id, gymId);
    return ApiResponse.success(res, httpStatus.OK, 'Exercise retrieved successfully', exercise);
  }

  static async updateExercise(req, res) {
    const gymId = req.gym._id;
    const { id } = req.params;
    
    const exercise = await ExerciseService.updateExercise(id, gymId, req.body);
    return ApiResponse.success(res, httpStatus.OK, 'Exercise updated successfully', exercise);
  }

  static async deleteExercise(req, res) {
    const gymId = req.gym._id;
    const { id } = req.params;
    
    const exercise = await ExerciseService.deleteExercise(id, gymId);
    return ApiResponse.success(res, httpStatus.OK, 'Exercise deleted successfully', exercise);
  }
}
