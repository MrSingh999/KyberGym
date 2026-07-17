import { DeliveryLogRepository } from './deliveryLog.repository.js';
import { BroadcastRepository } from '../broadcast/broadcast.repository.js';
import createError from 'http-errors';

export class DeliveryLogService {
  static async getLogs(gymId, query) {
    const { page = 1, limit = 10, broadcastId, status, channel } = query;
    const filter = {};

    if (broadcastId) {
      const broadcast = await BroadcastRepository.findById(broadcastId, gymId);
      if (!broadcast) throw createError.NotFound('Broadcast not found');
      filter.broadcastId = broadcast._id;
    }
    if (status) filter.status = status;
    if (channel) filter.channel = channel;

    return DeliveryLogRepository.findPaginated(gymId, filter, Number(page), Number(limit));
  }

  static async getLogById(id, gymId) {
    const log = await DeliveryLogRepository.findById(id, gymId);
    if (!log) throw createError.NotFound('Delivery log not found');
    return log;
  }
}
