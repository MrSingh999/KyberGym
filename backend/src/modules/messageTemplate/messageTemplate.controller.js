import { MessageTemplateService } from './messageTemplate.service.js';
import { ApiResponse } from '../../shared/ApiResponse.js';
import httpStatus from 'http-status';

export class MessageTemplateController {
  
  static async createTemplate(req, res) {
    const gymId = req.gym._id;
    const userId = req.user._id;
    const template = await MessageTemplateService.createTemplate(gymId, userId, req.body);
    return ApiResponse.success(res, httpStatus.CREATED, 'Template created successfully', template);
  }

  static async getTemplates(req, res) {
    const gymId = req.gym._id;
    const result = await MessageTemplateService.getTemplates(gymId, req.query);
    return res.status(httpStatus.OK).json({
      success: true,
      message: 'Templates retrieved successfully',
      data: result.data,
      meta: result.meta
    });
  }

  static async updateTemplate(req, res) {
    const gymId = req.gym._id;
    const { id } = req.params;
    const template = await MessageTemplateService.updateTemplate(id, gymId, req.body);
    return ApiResponse.success(res, httpStatus.OK, 'Template updated successfully', template);
  }

  static async deleteTemplate(req, res) {
    const gymId = req.gym._id;
    const { id } = req.params;
    const template = await MessageTemplateService.deleteTemplate(id, gymId);
    return ApiResponse.success(res, httpStatus.OK, 'Template deleted successfully', template);
  }
}
