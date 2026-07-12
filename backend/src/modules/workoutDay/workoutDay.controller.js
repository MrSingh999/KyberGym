import { WorkoutDayService } from './workoutDay.service.js';
import { ApiResponse } from '../../shared/ApiResponse.js';
import httpStatus from 'http-status';

export class WorkoutDayController {
  
  static async createDay(req, res) {
    const gymId = req.gym._id;
    const day = await WorkoutDayService.createDay(gymId, req.body);
    return ApiResponse.success(res, httpStatus.CREATED, 'Workout day created successfully', day);
  }

  static async getDaysByTemplate(req, res) {
    const gymId = req.gym._id;
    const { templateId } = req.query;
    
    if (!templateId) {
      return ApiResponse.error(res, httpStatus.BAD_REQUEST, 'templateId query parameter is required');
    }

    const days = await WorkoutDayService.getDaysByTemplate(gymId, templateId);
    return ApiResponse.success(res, httpStatus.OK, 'Workout days retrieved successfully', days);
  }

  static async getDayById(req, res) {
    const gymId = req.gym._id;
    const { id } = req.params;
    
    const day = await WorkoutDayService.getDayById(id, gymId);
    return ApiResponse.success(res, httpStatus.OK, 'Workout day retrieved successfully', day);
  }

  static async updateDay(req, res) {
    const gymId = req.gym._id;
    const { id } = req.params;
    
    const day = await WorkoutDayService.updateDay(id, gymId, req.body);
    return ApiResponse.success(res, httpStatus.OK, 'Workout day updated successfully', day);
  }

  static async deleteDay(req, res) {
    const gymId = req.gym._id;
    const { id } = req.params;
    
    const day = await WorkoutDayService.deleteDay(id, gymId);
    return ApiResponse.success(res, httpStatus.OK, 'Workout day deleted successfully', day);
  }
}
