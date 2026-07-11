import { WorkoutTemplateService } from './workoutTemplate.service.js';
import { ApiResponse } from '../../../shared/ApiResponse.js';
import httpStatus from 'http-status';

export class WorkoutTemplateController {
  static async createTemplate(req, res) {
    const gymId = req.gym._id;
    const userId = req.user._id;
    const template = await WorkoutTemplateService.createTemplate(gymId, userId, req.body);
    return ApiResponse.success(res, httpStatus.CREATED, 'Template created successfully', template);
  }

  static async getTemplates(req, res) {
    const gymId = req.gym._id;
    const result = await WorkoutTemplateService.getTemplates(gymId, req.query);
    return res.status(httpStatus.OK).json({
      success: true,
      message: 'Templates retrieved successfully',
      data: result.data,
      meta: result.meta
    });
  }

  static async getTemplateById(req, res) {
    const gymId = req.gym._id;
    const { id } = req.params;
    const template = await WorkoutTemplateService.getTemplateById(id, gymId);
    return ApiResponse.success(res, httpStatus.OK, 'Template retrieved successfully', template);
  }

  static async updateTemplate(req, res) {
    const gymId = req.gym._id;
    const { id } = req.params;
    const template = await WorkoutTemplateService.updateTemplate(id, gymId, req.body);
    return ApiResponse.success(res, httpStatus.OK, 'Template updated successfully', template);
  }

  static async deleteTemplate(req, res) {
    const gymId = req.gym._id;
    const { id } = req.params;
    const template = await WorkoutTemplateService.deleteTemplate(id, gymId);
    return ApiResponse.success(res, httpStatus.OK, 'Template deleted successfully', template);
  }
}
