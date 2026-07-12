import { PersonalWorkoutService } from './personalWorkout.service.js';
import { ApiResponse } from '../../shared/ApiResponse.js';
import httpStatus from 'http-status';

export class PersonalWorkoutController {
  
  static async createWorkout(req, res) {
    const gymId = req.gym._id;
    const userId = req.user._id;
    
    const workout = await PersonalWorkoutService.createWorkout(gymId, userId, req.body);
    return ApiResponse.success(res, httpStatus.CREATED, 'Personal workout created successfully', workout);
  }

  static async getWorkouts(req, res) {
    const gymId = req.gym._id;
    const result = await PersonalWorkoutService.getWorkouts(gymId, req.query);
    
    return res.status(httpStatus.OK).json({
      success: true,
      message: 'Personal workouts retrieved successfully',
      data: result.data,
      meta: result.meta
    });
  }

  static async getWorkoutById(req, res) {
    const gymId = req.gym._id;
    const { id } = req.params;
    
    const workout = await PersonalWorkoutService.getWorkoutById(id, gymId);
    return ApiResponse.success(res, httpStatus.OK, 'Personal workout retrieved successfully', workout);
  }

  static async updateWorkout(req, res) {
    const gymId = req.gym._id;
    const { id } = req.params;
    
    const workout = await PersonalWorkoutService.updateWorkout(id, gymId, req.body);
    return ApiResponse.success(res, httpStatus.OK, 'Personal workout updated successfully', workout);
  }

  static async deleteWorkout(req, res) {
    const gymId = req.gym._id;
    const { id } = req.params;
    
    const workout = await PersonalWorkoutService.deleteWorkout(id, gymId);
    return ApiResponse.success(res, httpStatus.OK, 'Personal workout deleted successfully', workout);
  }
}
