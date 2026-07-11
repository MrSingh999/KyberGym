import { BroadcastRepository } from './broadcast.repository.js';
import { broadcastQueue } from '../../jobs/queues.js';
import createError from 'http-errors';

export class BroadcastService {
  static async createBroadcast(gymId, userId, data) {
    // If scheduledAt is provided and is in the future, set status to scheduled
    let status = 'draft';
    if (data.scheduledAt && new Date(data.scheduledAt) > new Date()) {
      status = 'scheduled';
    }

    return BroadcastRepository.create({
      ...data,
      gymId,
      status,
      createdBy: userId
    });
  }

  static async getBroadcasts(gymId, query) {
    const { page = 1, limit = 10, channel, status } = query;
    const filter = {};

    if (channel) filter.channel = channel;
    if (status) filter.status = status;

    return BroadcastRepository.findPaginated(gymId, filter, Number(page), Number(limit));
  }

  static async getBroadcastById(id, gymId) {
    const broadcast = await BroadcastRepository.findById(id, gymId);
    if (!broadcast) throw createError.NotFound('Broadcast not found');
    return broadcast;
  }

  static async updateBroadcast(id, gymId, data) {
    const broadcast = await BroadcastRepository.findById(id, gymId);
    if (!broadcast) throw createError.NotFound('Broadcast not found');
    
    // Only draft or scheduled can be updated
    if (!['draft', 'scheduled'].includes(broadcast.status)) {
      throw createError.BadRequest('Only draft or scheduled broadcasts can be modified');
    }

    let status = broadcast.status;
    if (data.scheduledAt) {
      status = new Date(data.scheduledAt) > new Date() ? 'scheduled' : 'draft';
    }

    return BroadcastRepository.update(id, gymId, { ...data, status });
  }

  static async deleteBroadcast(id, gymId) {
    const broadcast = await BroadcastRepository.findById(id, gymId);
    if (!broadcast) throw createError.NotFound('Broadcast not found');
    
    if (['processing'].includes(broadcast.status)) {
      throw createError.BadRequest('Cannot delete a broadcast that is processing');
    }

    return BroadcastRepository.delete(id, gymId);
  }

  static async sendBroadcast(id, gymId) {
    const broadcast = await BroadcastRepository.findById(id, gymId);
    if (!broadcast) throw createError.NotFound('Broadcast not found');
    
    if (['processing', 'completed'].includes(broadcast.status)) {
      throw createError.BadRequest(`Broadcast is already ${broadcast.status}`);
    }

    // Update status to processing
    const updated = await BroadcastRepository.update(id, gymId, { 
      status: 'processing',
      sentAt: new Date()
    });

    // Drop job into queue
    await broadcastQueue.add('process-broadcast', { 
      broadcastId: broadcast._id,
      gymId: broadcast.gymId 
    });

    return updated;
  }
}
