import { Worker } from 'bullmq';
import { QUEUE_NAMES, redisConnection } from './queues.js';
import { EmailService } from '../services/email.service.js';
import { DeliveryLog } from '../modules/deliveryLog/models/DeliveryLog.model.js';
import { logger } from '../utils/logger.js';

export const emailWorker = new Worker(
  QUEUE_NAMES.EMAIL,
  async (job) => {
    const { gymId, broadcastId, memberId, to, subject, html, logId } = job.data;
    
    try {
      const result = await EmailService.sendEmail({ to, subject, html });

      await DeliveryLog.findByIdAndUpdate(logId, {
        status: 'sent',
        providerMessageId: result.messageId,
        sentAt: new Date()
      });

      return result;
    } catch (error) {
      logger.error(`[EmailWorker] Job failed: ${error.message}`);
      
      await DeliveryLog.findByIdAndUpdate(logId, {
        status: 'failed',
        errorMessage: error.message,
        $inc: { retryCount: 1 }
      });
      
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5
  }
);

emailWorker.on('failed', (job, err) => {
  logger.error(`[EmailWorker] Job ${job.id} failed with error ${err.message}`);
});
