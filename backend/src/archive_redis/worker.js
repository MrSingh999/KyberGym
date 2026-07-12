import { connectDB, closeDB } from './database/index.js';
import { logger } from './config/logger.js';
import { redisConnection } from './jobs/queues.js';
import { setupCronJobs } from './jobs/cron.js';

// Import workers to instantiate them
import './jobs/whatsapp.worker.js';
import './jobs/email.worker.js';
import './jobs/broadcast.worker.js';

// Handle synchronous uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('CRITICAL: Uncaught Exception thrown in Worker!');
  logger.error(err);
  process.exit(1);
});

const startWorker = async () => {
  try {
    logger.info('[Worker] Starting background worker processes...');
    
    // Connect to DB for Worker processing
    await connectDB();
    
    // Setup Cron Jobs
    setupCronJobs();
    
    logger.info('[Worker] All workers running successfully');

    // Graceful Shutdown Handlers
    const gracefulShutdown = async (signal) => {
      logger.info(`[SHUTDOWN] Received ${signal}. Shutting down worker gracefully...`);
      
      try {
        // Workers should be closed via their respective close methods if needed
        // For simplicity, BullMQ workers stop pulling new jobs when redis connection drops
        await closeDB();
        await redisConnection.quit();
        logger.info('[SHUTDOWN] Worker DB and Redis closed.');
        process.exit(0);
      } catch (err) {
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle asynchronous unhandled rejections
    process.on('unhandledRejection', (err) => {
      logger.error('CRITICAL: Unhandled Promise Rejection in Worker!');
      logger.error(err);
      gracefulShutdown('unhandledRejection');
    });

  } catch (error) {
    logger.error(`[Worker] Failed to start: ${error.message}`);
    process.exit(1);
  }
};

startWorker();
