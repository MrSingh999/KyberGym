import { MemberWorkoutService } from './memberWorkout.service.js';
import { ApiResponse } from '../../shared/ApiResponse.js';
import httpStatus from 'http-status';

export class MemberWorkoutController {
  
  static async assignWorkout(req, res) {
    const gymId = req.gym._id;
    const userId = req.user._id;
    
    const workout = await MemberWorkoutService.assignWorkout(gymId, userId, req.body);
    return ApiResponse.success(res, httpStatus.CREATED, 'Workout assigned successfully', workout);
  }

  static async getWorkouts(req, res) {
    const gymId = req.gym._id;
    const result = await MemberWorkoutService.getWorkouts(gymId, req.query);
    
    return res.status(httpStatus.OK).json({
      success: true,
      message: 'Workouts retrieved successfully',
      data: result.data,
      meta: result.meta
    });
  }

  static async getWorkoutById(req, res) {
    const gymId = req.gym._id;
    const { id } = req.params;
    
    const workout = await MemberWorkoutService.getWorkoutById(id, gymId);
    return ApiResponse.success(res, httpStatus.OK, 'Workout retrieved successfully', workout);
  }

  static async updateStatus(req, res) {
    const gymId = req.gym._id;
    const { id } = req.params;
    
    const workout = await MemberWorkoutService.updateStatus(id, gymId, req.body);
    return ApiResponse.success(res, httpStatus.OK, 'Workout status updated successfully', workout);
  }
}
