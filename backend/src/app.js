import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import apiRoutes from './routes/index.js';

const app = express();

// Trust reverse proxy (e.g., Nginx, Vercel, Heroku) for correct client IP in rate limiting
app.set('trust proxy', 1);

// 1. Security Middleware
app.use(helmet()); // Set secure HTTP headers
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));

// Rate limiting: max 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// 2. Parsers & Compression
app.use(cookieParser());
// Body parser with 10kb limit to prevent payload overload
app.use(express.json({ limit: '10kb' })); 
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(compression()); // Compress response bodies

// 3. Data Sanitization
app.use(mongoSanitize()); // Prevent NoSQL injection by stripping $ from inputs
app.use(xss()); // Sanitize user input to prevent XSS

// 4. Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) }
  }));
}

// 5. Routes Registration
app.use('/api/v1', apiRoutes);

// 6. Error Handling
app.use(notFoundHandler); // Catch 404s
app.use(errorHandler); // Global error handler

export default app;
