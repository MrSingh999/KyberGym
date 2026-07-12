import { Worker } from 'bullmq';
import { QUEUE_NAMES, redisConnection, whatsappQueue, emailQueue } from './queues.js';
import { BroadcastRepository } from '../modules/broadcast/broadcast.repository.js';
import { Member } from '../modules/member/models/Member.model.js';
import { MemberSubscription } from '../modules/memberSubscription/models/MemberSubscription.model.js';
import { DeliveryLog } from '../modules/deliveryLog/models/DeliveryLog.model.js';
import { logger } from '../utils/logger.js';
import { startOfDay, endOfDay, addDays } from 'date-fns';

export const broadcastWorker = new Worker(
  QUEUE_NAMES.BROADCAST,
  async (job) => {
    const { broadcastId, gymId } = job.data;
    logger.info(`[BroadcastWorker] Processing broadcast ${broadcastId}`);

    const broadcast = await BroadcastRepository.findById(broadcastId, gymId);
    if (!broadcast) throw new Error('Broadcast not found');

    const { target, selectedMemberIds } = broadcast.recipientCriteria;
    
    // 1. Resolve Recipients
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
      return { success: true, message: 'No recipients found' };
    }

    // Fetch member details
    const members = await Member.find({ _id: { $in: memberIds }, gymId }).select('_id phone email fullName');

    // 2. Fan-out jobs
    for (const member of members) {
      // Create initial Delivery Log
      const log = await DeliveryLog.create({
        gymId,
        broadcastId,
        memberId: member._id,
        channel: broadcast.channel,
        status: 'queued'
      });

      const messageContent = broadcast.messageTemplateId ? broadcast.messageTemplateId.content : broadcast.message;
      const subjectContent = broadcast.messageTemplateId ? broadcast.messageTemplateId.subject : broadcast.title;

      // Replace variables simple implementation (e.g., {{name}} -> John)
      const parsedMessage = messageContent ? messageContent.replace(/{{name}}/g, member.fullName) : '';

      if (broadcast.channel === 'whatsapp' && member.phone) {
        await whatsappQueue.add('send-whatsapp', {
          gymId,
          broadcastId,
          memberId: member._id,
          to: member.phone,
          text: parsedMessage,
          logId: log._id
        });
      } else if (broadcast.channel === 'email' && member.email) {
        await emailQueue.add('send-email', {
          gymId,
          broadcastId,
          memberId: member._id,
          to: member.email,
          subject: subjectContent,
          html: parsedMessage,
          logId: log._id
        });
      } else {
        // Mark failed if missing contact info
        await DeliveryLog.findByIdAndUpdate(log._id, { status: 'failed', errorMessage: 'Missing contact info' });
      }
    }

    // 3. Mark broadcast completed
    await BroadcastRepository.update(broadcastId, gymId, { status: 'completed' });
    
    return { success: true, recipients: members.length };
  },
  {
    connection: redisConnection,
  }
);

broadcastWorker.on('failed', (job, err) => {
  logger.error(`[BroadcastWorker] Job ${job.id} failed with error ${err.message}`);
});
