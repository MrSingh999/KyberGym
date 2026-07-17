import mongoose from 'mongoose';
import { Gym } from '../modules/gyms/models/Gym.model.js';
import { User } from '../modules/users/models/User.model.js';
import { Member } from '../modules/member/models/Member.model.js';
import { MembershipPlan } from '../modules/membershipPlan/models/MembershipPlan.model.js';
import { MemberSubscription } from '../modules/memberSubscription/models/MemberSubscription.model.js';
import { Payment } from '../modules/payment/models/Payment.model.js';
import { Workout } from '../modules/workouts/models/Workout.model.js';
import { WorkoutDay } from '../modules/workoutDay/models/WorkoutDay.model.js';
import { Notification } from '../modules/notification/models/Notification.model.js';
import { Broadcast } from '../modules/broadcast/models/Broadcast.model.js';
import { MessageTemplate } from '../modules/messageTemplate/models/MessageTemplate.model.js';
import { DeliveryLog } from '../modules/deliveryLog/models/DeliveryLog.model.js';
import { MemberQr } from '../modules/memberQr/models/MemberQr.model.js';
import { Attendance } from '../modules/attendance/models/Attendance.model.js';

import { generatePublicId } from '../shared/publicId.js';
import { ENTITY_PREFIXES } from '../shared/idPrefixes.js';
import { logger } from '../config/logger.js';
import { connectDB, closeDB } from './connection.js';

const BATCH_SIZE = 100;

const MIGRATION_TARGETS = [
  { model: Gym, prefixKey: 'GYM', name: 'Gym' },
  { model: User, prefixKey: 'USR', name: 'User' },
  { model: Member, prefixKey: 'MEM', name: 'Member' },
  { model: MembershipPlan, prefixKey: 'PLAN', name: 'MembershipPlan' },
  { model: MemberSubscription, prefixKey: 'SUB', name: 'MemberSubscription' },
  { model: Payment, prefixKey: 'PAY', name: 'Payment' },
  { model: Workout, prefixKey: 'WRK', name: 'Workout' },
  { model: WorkoutDay, prefixKey: 'WD', name: 'WorkoutDay' },
  { model: Notification, prefixKey: 'NOTIF', name: 'Notification' },
  { model: Broadcast, prefixKey: 'BC', name: 'Broadcast' },
  { model: MessageTemplate, prefixKey: 'TMPL', name: 'MessageTemplate' },
  { model: DeliveryLog, prefixKey: 'LOG', name: 'DeliveryLog' },
  { model: MemberQr, prefixKey: 'QR', name: 'MemberQr' },
  { model: Attendance, prefixKey: 'ATT', name: 'Attendance' },
];

/**
 * Backfills publicIds for documents that are missing them.
 * Processes in batches, handles duplicates, and is idempotent.
 */
export async function migratePublicIds() {
  logger.info('Starting Public ID backfill migration...');
  
  for (const target of MIGRATION_TARGETS) {
    try {
      const query = {
        $or: [
          { publicId: { $exists: false } },
          { publicId: null },
          { publicId: '' }
        ]
      };

      const count = await target.model.countDocuments(query);
      if (count === 0) {
        logger.info(`Collection [${target.name}]: No documents missing publicId.`);
        continue;
      }

      logger.info(`Collection [${target.name}]: Found ${count} documents missing publicId. Migrating in batches of ${BATCH_SIZE}...`);

      const cursor = target.model.find(query).select('_id').cursor();
      let batch = [];
      let totalMigrated = 0;

      for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
        let publicId = '';
        let success = false;
        let retries = 0;

        while (!success && retries < 10) {
          publicId = generatePublicId(ENTITY_PREFIXES[target.prefixKey]);
          // Check for collision within the database
          const existing = await target.model.findOne({ publicId }).select('_id').lean();
          if (!existing) {
            success = true;
          } else {
            retries++;
          }
        }

        if (!success) {
          logger.error(`Collection [${target.name}]: Failed to generate a unique publicId for doc ${doc._id} after ${retries} retries.`);
          continue;
        }

        batch.push({
          updateOne: {
            filter: { _id: doc._id },
            update: { $set: { publicId } }
          }
        });

        if (batch.length >= BATCH_SIZE) {
          try {
            await target.model.collection.bulkWrite(batch);
            totalMigrated += batch.length;
          } catch (err) {
            logger.error(`Collection [${target.name}]: Bulk write failed. Retrying individually...`);
            for (const op of batch) {
              try {
                await target.model.collection.updateOne(op.updateOne.filter, op.updateOne.update);
                totalMigrated++;
              } catch (subErr) {
                logger.error(`Collection [${target.name}]: Failed to update doc ${op.updateOne.filter._id}: ${subErr.message}`);
              }
            }
          }
          batch = [];
        }
      }

      // Process remainder
      if (batch.length > 0) {
        try {
          await target.model.collection.bulkWrite(batch);
          totalMigrated += batch.length;
        } catch (err) {
          logger.error(`Collection [${target.name}]: Remainder bulk write failed. Retrying individually...`);
          for (const op of batch) {
            try {
              await target.model.collection.updateOne(op.updateOne.filter, op.updateOne.update);
              totalMigrated++;
            } catch (subErr) {
              logger.error(`Collection [${target.name}]: Failed to update doc ${op.updateOne.filter._id}: ${subErr.message}`);
            }
          }
        }
      }

      logger.info(`Collection [${target.name}]: Successfully backfilled publicId for ${totalMigrated} documents.`);

      // Ensure indexes are synced/built
      logger.info(`Collection [${target.name}]: Syncing indexes...`);
      await target.model.syncIndexes();

    } catch (error) {
      logger.error(`Failed to migrate collection [${target.name}]: ${error.message}`);
    }
  }

  logger.info('Public ID backfill migration completed.');
}

// Support running the script directly
if (process.argv[1] && (process.argv[1].endsWith('migratePublicIds.js') || process.argv[1].endsWith('migratePublicIds'))) {
  (async () => {
    try {
      await connectDB();
      await migratePublicIds();
      await closeDB();
      process.exit(0);
    } catch (err) {
      logger.error(`Migration script crashed: ${err.message}`);
      process.exit(1);
    }
  })();
}
