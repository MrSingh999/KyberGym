import { Notification } from './models/Notification.model.js';

export class NotificationRepository {
  static async create(data) {
    return Notification.create(data);
  }

  static async findPaginated(gymId, userId, filter = {}, page = 1, limit = 10) {
    const query = { gymId, userId, ...filter };
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(query)
    ]);

    return {
      data: notifications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async markAsRead(id, gymId, userId) {
    return Notification.findOneAndUpdate(
      { _id: id, gymId, userId },
      { read: true, readAt: new Date() },
      { new: true }
    );
  }

  static async markAllAsRead(gymId, userId) {
    return Notification.updateMany(
      { gymId, userId, read: false },
      { read: true, readAt: new Date() }
    );
  }
}
