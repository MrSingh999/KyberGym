import { z } from 'zod';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  
  MONGO_URI: z.string().url({ message: 'MONGO_URI must be a valid URL' }),
  
  REDIS_URL: z.string().url({ message: 'REDIS_URL must be a valid Redis connection string' }),
  
  JWT_SECRET: z.string().min(32, { message: 'JWT_SECRET must be at least 32 characters long' }),
  JWT_EXPIRES_IN: z.string().default('1d'),
  
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  
  RESEND_API_KEY: z.string().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  // If logger is not initialized, we fall back to console
  if (logger && logger.error) {
    logger.error('❌ Invalid environment variables:', _env.error.format());
  } else {
    console.error('❌ Invalid environment variables:', _env.error.format());
  }
  process.exit(1); 
}

export const env = _env.data;

export const appConfig = {
  env: env.NODE_ENV,
  port: parseInt(env.PORT, 10),
  frontendUrl: env.FRONTEND_URL,
};

export const dbConfig = {
  uri: env.MONGO_URI,
};

export const redisConfig = {
  url: env.REDIS_URL,
};

export const authConfig = {
  jwtSecret: env.JWT_SECRET,
  jwtExpiresIn: env.JWT_EXPIRES_IN,
};

export const cloudinaryConfig = {
  cloudName: env.CLOUDINARY_CLOUD_NAME,
  apiKey: env.CLOUDINARY_API_KEY,
  apiSecret: env.CLOUDINARY_API_SECRET,
};

export const resendConfig = {
  apiKey: env.RESEND_API_KEY,
};
