import mongoose from 'mongoose';
import { connectDB, closeDB } from './connection.js';
import { logger } from '../config/logger.js';

export async function backfillPayments() {
  logger.info('Starting payment backfill for subscriptions missing payments...');

  const db = mongoose.connection.db;
  const subscriptions = db.collection('membersubscriptions');

  const pipeline = [
    {
      $lookup: {
        from: 'memberpayments',
        let: { subId: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$subscriptionId', '$$subId'] } } },
          { $limit: 1 },
        ],
        as: 'payments',
      },
    },
    { $match: { payments: [] } },
    {
      $lookup: {
        from: 'membershipplans',
        localField: 'membershipPlanId',
        foreignField: '_id',
        as: 'plan',
      },
    },
    { $unwind: { path: '$plan', preserveNullAndEmptyArrays: true } },
  ];

  const missing = await subscriptions.aggregate(pipeline).toArray();
  logger.info(`Found ${missing.length} subscriptions without payments`);

  const payments = db.collection('memberpayments');
  let created = 0;

  for (const sub of missing) {
    const planName = sub.plan?.name || 'Unknown Plan';
    const planId = sub.plan?._id || sub.membershipPlanId;
    const finalAmount = sub.finalAmount ?? sub.amount ?? 0;

    try {
      const result = await payments.insertOne({
        publicId: `MPAY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        gymId: sub.gymId,
        memberId: sub.memberId,
        subscriptionId: sub._id,
        amount: sub.amount ?? 0,
        discount: sub.discount ?? 0,
        finalAmount,
        paymentMethod: 'cash',
        transactionId: undefined,
        paymentDate: sub.startDate || sub.createdAt || new Date(),
        status: 'paid',
        paymentFor: {
          planId,
          planName,
          startDate: sub.startDate,
          endDate: sub.endDate,
        },
        receivedBy: sub.assignedBy,
        notes: sub.notes || 'Backfilled from subscription',
        createdAt: sub.createdAt || new Date(),
        updatedAt: new Date(),
      });
      created++;

      await subscriptions.updateOne(
        { _id: sub._id },
        { $set: { paymentStatus: 'paid', lastPaymentDate: sub.startDate || new Date() } },
      );
    } catch (err) {
      logger.error(`Failed to backfill payment for subscription ${sub._id}: ${err.message}`);
    }
  }

  logger.info(`Backfill complete: ${created} payments created`);
  return { found: missing.length, created };
}

if (process.argv[1] && (process.argv[1].endsWith('backfillPayments.js') || process.argv[1].endsWith('backfillPayments'))) {
  connectDB()
    .then(() => backfillPayments())
    .then(() => closeDB())
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error(`Backfill failed: ${err.message}`);
      process.exit(1);
    });
}
