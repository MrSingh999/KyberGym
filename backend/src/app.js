import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import apiRoutes from './routes/index.js';
import { HealthCheckController } from './modules/health/health.controller.js';
import { redisConnection } from './jobs/queues.js';

const app = express();

// Trust reverse proxy (e.g., Dokploy, Nginx, Vercel)
app.set('trust proxy', 1);

// 1. Security Middleware
app.use(helmet()); 
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));

// Rate limiting backed by Redis
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  standardHeaders: true, 
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redisConnection.call(...args),
  }),
  message: { success: false, message: 'Too many requests from this IP, please try again later.' },
});

app.use('/api', limiter);

// 2. Parsers & Compression
app.use(cookieParser());
app.use(express.json({ limit: '10kb' })); 
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(compression()); 

// 3. Data Sanitization
app.use(mongoSanitize());

// 4. Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) }
  }));
}

// 5. Health Checks
app.get('/health', HealthCheckController.liveness);
app.get('/health/ready', HealthCheckController.readiness);

// 6. Routes Registration
app.use('/api/v1', apiRoutes);

// 7. Error Handling
app.use(notFoundHandler); 
app.use(errorHandler); 

export default app;
