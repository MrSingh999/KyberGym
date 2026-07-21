import mongoose from 'mongoose';
import { connectDB, closeDB } from './connection.js';
import { logger } from '../config/logger.js';

export async function migrateFeatureFlags() {
  logger.info('Starting feature flag migration: payments → memberPayments...');

  const db = mongoose.connection.db;
  const gyms = db.collection('gyms');

  const result = await gyms.updateMany(
    { 'features.payments': { $exists: true } },
    [
      {
        $set: {
          'features.memberPayments': '$features.payments',
        },
      },
      {
        $unset: 'features.payments',
      },
    ]
  );

  logger.info(`Migration complete. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
  return result;
}

if (process.argv[1] && (process.argv[1].endsWith('migrateFeatureFlags.js') || process.argv[1].endsWith('migrateFeatureFlags'))) {
  connectDB()
    .then(() => migrateFeatureFlags())
    .then(() => closeDB())
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error(`Migration failed: ${err.message}`);
      process.exit(1);
    });
}
