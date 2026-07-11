import app from './app.js';
import { connectDB, closeDB } from './database/index.js';
import { seedDefaultSaasPlan } from './database/seeder.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';

// Handle synchronous uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('CRITICAL: Uncaught Exception thrown!');
  logger.error(err);
  process.exit(1);
});

// Initialize server
const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Run initial seeders
    await seedDefaultSaasPlan();

    // 3. Start Express App
    const server = app.listen(env.PORT, () => {
      logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });

    // 4. Graceful Shutdown Handlers
    const gracefulShutdown = (signal) => {
      logger.info(`[SHUTDOWN] Received ${signal}. Shutting down gracefully...`);
      
      server.close(async () => {
        logger.info('[SHUTDOWN] HTTP server closed.');
        await closeDB();
        process.exit(0);
      });

      // Force shutdown after 10s
      setTimeout(() => {
        logger.error('[SHUTDOWN] Force shutdown timed out. Exiting forcefully.');
        process.exit(1);
      }, 10000).unref();
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle asynchronous unhandled rejections
    process.on('unhandledRejection', (err) => {
      logger.error('CRITICAL: Unhandled Promise Rejection!');
      logger.error(err);
      gracefulShutdown('unhandledRejection');
    });

  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
