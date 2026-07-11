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
import memberRoutes from '../modules/member/member.routes.js';
import membershipPlanRoutes from '../modules/membershipPlan/membershipPlan.routes.js';
import memberSubscriptionRoutes from '../modules/memberSubscription/memberSubscription.routes.js';
import paymentRoutes from '../modules/payment/payment.routes.js';
import dashboardRoutes from '../modules/dashboard/dashboard.routes.js';

// Module Routes Registration
router.use('/auth', authRoutes);
router.use('/saas-plans', saasPlanRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/members', memberRoutes);
router.use('/membership-plans', membershipPlanRoutes);
router.use('/member-subscriptions', memberSubscriptionRoutes);
router.use('/payments', paymentRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
