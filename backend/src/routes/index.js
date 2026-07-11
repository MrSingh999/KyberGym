import { Router } from 'express';
import { ApiResponse } from '../shared/ApiResponse.js';
import httpStatus from 'http-status';
import { env } from '../config/env.js';

const router = Router();

// Health Check Route
router.get('/health', (req, res) => {
  res.status(httpStatus.OK).json({
    status: 'UP',
    uptime: process.uptime(),
    environment: env.NODE_ENV,
    version: '1.0.0', // Could be dynamic from package.json
    timestamp: new Date().toISOString(),
  });
});

import authRoutes from '../modules/auth/auth.routes.js';
import saasPlanRoutes from '../modules/saasPlan/saasPlan.routes.js';
import subscriptionRoutes from '../modules/subscription/subscription.routes.js';

// Module Routes Registration
router.use('/auth', authRoutes);
router.use('/saas-plans', saasPlanRoutes);
router.use('/subscriptions', subscriptionRoutes);

export default router;
