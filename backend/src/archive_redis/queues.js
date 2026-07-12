import { Queue } from 'bullmq';
import { env } from '../config/env.js';
import Redis from 'ioredis';

const redisConnection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const QUEUE_NAMES = {
  WHATSAPP: 'whatsappQueue',
  EMAIL: 'emailQueue',
  BROADCAST: 'broadcastQueue',
  NOTIFICATION: 'notificationQueue',
};

const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000,
  },
  removeOnComplete: true,
  removeOnFail: false,
};

export const whatsappQueue = new Queue(QUEUE_NAMES.WHATSAPP, {
  connection: redisConnection,
  defaultJobOptions,
});

export const emailQueue = new Queue(QUEUE_NAMES.EMAIL, {
  connection: redisConnection,
  defaultJobOptions,
});

export const broadcastQueue = new Queue(QUEUE_NAMES.BROADCAST, {
  connection: redisConnection,
  defaultJobOptions,
});

export const notificationQueue = new Queue(QUEUE_NAMES.NOTIFICATION, {
  connection: redisConnection,
  defaultJobOptions,
});

export { redisConnection };
