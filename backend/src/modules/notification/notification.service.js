import { NotificationRepository } from './notification.repository.js';
import createError from 'http-errors';

export class NotificationService {
  static async getNotifications(gymId, userId, query) {
    const { page = 1, limit = 10, read } = query;
    const filter = {};

    if (read !== undefined) {
      filter.read = read === 'true';
    }

    return NotificationRepository.findPaginated(gymId, userId, filter, Number(page), Number(limit));
  }

  static async markAsRead(id, gymId, userId) {
    const notification = await NotificationRepository.markAsRead(id, gymId, userId);
    if (!notification) throw createError.NotFound('Notification not found');
    return notification;
  }

  static async markAllAsRead(gymId, userId) {
    await NotificationRepository.markAllAsRead(gymId, userId);
    return { success: true };
  }
}
