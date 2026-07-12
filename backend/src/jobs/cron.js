import cron from 'node-cron';
import { logger } from '../utils/logger.js';
import { BroadcastRepository } from '../modules/broadcast/broadcast.repository.js';
import { BroadcastService } from '../modules/broadcast/broadcast.service.js';

/**
 * Setup global cron jobs for the backend
 */
export function setupCronJobs() {
  logger.info('[Cron] Setting up scheduled tasks');

  // Run every minute to check for scheduled broadcasts
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const scheduledBroadcasts = await BroadcastRepository.findScheduledToRun(now);

      if (scheduledBroadcasts.length > 0) {
        logger.info(`[Cron] Found ${scheduledBroadcasts.length} scheduled broadcasts to send`);
        
        for (const broadcast of scheduledBroadcasts) {
          // Update status immediately so another cron tick doesn't pick it up
          await BroadcastRepository.update(broadcast._id, broadcast.gymId, { status: 'processing', sentAt: now });
          
          // Process directly via service without queue
          BroadcastService.processBroadcastInBackground(broadcast._id, broadcast.gymId).catch(err => {
            logger.error(`[Cron] Broadcast processing failed: ${err.message}`);
          });
        }
      }
    } catch (error) {
      logger.error(`[Cron] Error processing scheduled broadcasts: ${error.message}`);
    }
  });

  // Future scheduled task: Every day at 8:00 AM, automatically generate Reminders
  // For "Due in 3 days", "Expired today", etc., and push them to Broadcast system.
  // cron.schedule('0 8 * * *', async () => {
  //   // Automated Reminders Logic...
  // });
}
