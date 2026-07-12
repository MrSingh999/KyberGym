import { BroadcastRepository } from './broadcast.repository.js';
import { Member } from '../member/models/Member.model.js';
import { MemberSubscription } from '../memberSubscription/models/MemberSubscription.model.js';
import { DeliveryLog } from '../deliveryLog/models/DeliveryLog.model.js';
import { WhatsappService } from '../../services/whatsapp.service.js';
import { EmailService } from '../../services/email.service.js';
import { logger } from '../../config/logger.js';
import { startOfDay, endOfDay, addDays } from 'date-fns';
import createError from 'http-errors';

export class BroadcastService {
  static async createBroadcast(gymId, userId, data) {
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

    const updated = await BroadcastRepository.update(id, gymId, { 
      status: 'processing',
      sentAt: new Date()
    });

    // TODO: Reintroduce Redis/BullMQ queues here when scaling beyond ~50 gyms 
    // to prevent blocking the event loop and for better resilience.
    // For MVP, we process in memory asynchronously.
    this.processBroadcastInBackground(id, gymId).catch(err => {
      logger.error(`[BroadcastService] Background processing failed for ${id}: ${err.message}`);
    });

    return updated;
  }

  /**
   * Processes a broadcast in-memory in chunks.
   * This is a simplified MVP replacement for BullMQ workers.
   */
  static async processBroadcastInBackground(broadcastId, gymId) {
    logger.info(`[BroadcastService] Processing broadcast ${broadcastId} in background`);

    try {
      const broadcast = await BroadcastRepository.findById(broadcastId, gymId);
      if (!broadcast) return;

      const { target, selectedMemberIds } = broadcast.recipientCriteria;
      let memberIds = [];
      
      if (target === 'selected') {
        memberIds = selectedMemberIds;
      } else if (target === 'all') {
        const members = await Member.find({ gymId }).select('_id');
        memberIds = members.map(m => m._id);
      } else if (target === 'active') {
        const members = await Member.find({ gymId, status: 'active' }).select('_id');
        memberIds = members.map(m => m._id);
      } else if (['dueToday', 'dueIn3Days', 'dueIn7Days'].includes(target)) {
        let targetDate = new Date();
        if (target === 'dueIn3Days') targetDate = addDays(new Date(), 3);
        if (target === 'dueIn7Days') targetDate = addDays(new Date(), 7);
        
        const subs = await MemberSubscription.find({
          gymId,
          status: 'active',
          endDate: { $gte: startOfDay(targetDate), $lte: endOfDay(targetDate) }
        }).select('memberId');
        
        memberIds = subs.map(s => s.memberId);
      }

      if (memberIds.length === 0) {
        await BroadcastRepository.update(broadcastId, gymId, { status: 'completed' });
        return;
      }

      const members = await Member.find({ _id: { $in: memberIds }, gymId }).select('_id phone email fullName');

      const messageContent = broadcast.messageTemplateId ? broadcast.messageTemplateId.content : broadcast.message;
      const subjectContent = broadcast.messageTemplateId ? broadcast.messageTemplateId.subject : broadcast.title;

      const CHUNK_SIZE = 50;
      for (let i = 0; i < members.length; i += CHUNK_SIZE) {
        const chunk = members.slice(i, i + CHUNK_SIZE);
        
        // Process a chunk
        const promises = chunk.map(async (member) => {
          const log = await DeliveryLog.create({
            gymId, broadcastId, memberId: member._id, channel: broadcast.channel, status: 'queued'
          });

          const parsedMessage = messageContent ? messageContent.replace(/{{name}}/g, member.fullName) : '';

          try {
            let result;
            if (broadcast.channel === 'whatsapp' && member.phone) {
              const templateName = broadcast.messageTemplateId ? broadcast.messageTemplateId.name : null;
              if (templateName) {
                result = await WhatsappService.sendTemplateMessage({ to: member.phone, templateName, variables: [] });
              } else {
                result = await WhatsappService.sendTextMessage({ to: member.phone, text: parsedMessage });
              }
            } else if (broadcast.channel === 'email' && member.email) {
              result = await EmailService.sendEmail({ to: member.email, subject: subjectContent, html: parsedMessage });
            } else {
              throw new Error('Missing contact info');
            }

            await DeliveryLog.findByIdAndUpdate(log._id, { status: 'sent', providerMessageId: result?.messageId, sentAt: new Date() });
          } catch (error) {
            await DeliveryLog.findByIdAndUpdate(log._id, { status: 'failed', errorMessage: error.message });
          }
        });

        await Promise.all(promises);
        
        // Small delay to yield the event loop (MVP simplification)
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      await BroadcastRepository.update(broadcastId, gymId, { status: 'completed' });
      logger.info(`[BroadcastService] Broadcast ${broadcastId} completed for ${members.length} members`);
      
    } catch (error) {
      logger.error(`[BroadcastService] Failed to process broadcast ${broadcastId}: ${error.message}`);
      await BroadcastRepository.update(broadcastId, gymId, { status: 'failed' });
    }
  }
}
