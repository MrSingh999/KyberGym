import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  MONGO_URI: z.string().url({ message: 'MONGO_URI must be a valid URL' }),
  JWT_SECRET: z.string().min(32, { message: 'JWT_SECRET must be at least 32 characters long' }),
  JWT_EXPIRES_IN: z.string().default('1d'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  process.exit(1); // Graceful startup failure
}

export const env = _env.data;
