import { NotificationService } from './notification.service.js';
import { ApiResponse } from '../../../shared/ApiResponse.js';
import httpStatus from 'http-status';

export class NotificationController {
  
  static async getNotifications(req, res) {
    const gymId = req.gym._id;
    const userId = req.user._id;
    const result = await NotificationService.getNotifications(gymId, userId, req.query);
    
    return res.status(httpStatus.OK).json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: result.data,
      meta: result.meta
    });
  }

  static async markAsRead(req, res) {
    const gymId = req.gym._id;
    const userId = req.user._id;
    const { id } = req.params;
    
    const notification = await NotificationService.markAsRead(id, gymId, userId);
    return ApiResponse.success(res, httpStatus.OK, 'Notification marked as read', notification);
  }

  static async markAllAsRead(req, res) {
    const gymId = req.gym._id;
    const userId = req.user._id;
    
    await NotificationService.markAllAsRead(gymId, userId);
    return ApiResponse.success(res, httpStatus.OK, 'All notifications marked as read', null);
  }
}
