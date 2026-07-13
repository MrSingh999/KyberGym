import { NotificationService } from './notification.service.js';
import { ApiSuccess } from '../../shared/ApiSuccess.js';
import httpStatus from 'http-status';

export class NotificationController {
  
  static async getNotifications(req, res) {
    const gymId = req.gym._id;
    const userId = req.user._id;
    const result = await NotificationService.getNotifications(gymId, userId, req.query);
    
    return ApiSuccess.send(res, httpStatus.OK, 'Notifications retrieved successfully', result.data, result.meta);
  }

  static async markAsRead(req, res) {
    const gymId = req.gym._id;
    const userId = req.user._id;
    const { id } = req.params;
    
    const notification = await NotificationService.markAsRead(id, gymId, userId);
    return ApiSuccess.send(res, httpStatus.OK, 'Notification marked as read', notification);
  }

  static async markAllAsRead(req, res) {
    const gymId = req.gym._id;
    const userId = req.user._id;
    
    await NotificationService.markAllAsRead(gymId, userId);
    return ApiSuccess.send(res, httpStatus.OK, 'All notifications marked as read', null);
  }
}
