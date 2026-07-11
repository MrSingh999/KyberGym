import { Worker } from 'bullmq';
import { QUEUE_NAMES, redisConnection } from './queues.js';
import { WhatsappService } from '../services/whatsapp.service.js';
import { DeliveryLog } from '../modules/deliveryLog/models/DeliveryLog.model.js';
import { logger } from '../utils/logger.js';

export const whatsappWorker = new Worker(
  QUEUE_NAMES.WHATSAPP,
  async (job) => {
    const { gymId, broadcastId, memberId, to, templateName, variables, text, logId } = job.data;
    
    try {
      let result;
      if (templateName) {
        result = await WhatsappService.sendTemplateMessage({ to, templateName, variables });
      } else {
        result = await WhatsappService.sendTextMessage({ to, text });
      }

      // Update DeliveryLog
      await DeliveryLog.findByIdAndUpdate(logId, {
        status: 'sent',
        providerMessageId: result.messageId,
        sentAt: new Date()
      });

      return result;
    } catch (error) {
      logger.error(`[WhatsappWorker] Job failed: ${error.message}`);
      
      // Update DeliveryLog with error
      await DeliveryLog.findByIdAndUpdate(logId, {
        status: 'failed',
        errorMessage: error.message,
        $inc: { retryCount: 1 }
      });
      
      throw error; // Trigger bullmq retry
    }
  },
  {
    connection: redisConnection,
    concurrency: 5 // Process 5 messages concurrently
  }
);

whatsappWorker.on('failed', (job, err) => {
  logger.error(`[WhatsappWorker] Job ${job.id} failed with error ${err.message}`);
});
