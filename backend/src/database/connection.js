import mongoose from 'mongoose';
import { logger } from '../config/logger.js';
import { dbConfig } from '../config/database.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(dbConfig.uri, dbConfig.options);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    
    // Connection events
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...');
    });

  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export const closeDB = async () => {
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed.');
  }
};
