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
import exerciseRoutes from '../modules/exercise/exercise.routes.js';
import workoutTemplateRoutes from '../modules/workoutTemplate/workoutTemplate.routes.js';
import workoutDayRoutes from '../modules/workoutDay/workoutDay.routes.js';
import memberWorkoutRoutes from '../modules/memberWorkout/memberWorkout.routes.js';
import personalWorkoutRoutes from '../modules/personalWorkout/personalWorkout.routes.js';
import messageTemplateRoutes from '../modules/messageTemplate/messageTemplate.routes.js';
import broadcastRoutes from '../modules/broadcast/broadcast.routes.js';
import notificationRoutes from '../modules/notification/notification.routes.js';
import deliveryLogRoutes from '../modules/deliveryLog/deliveryLog.routes.js';
import brandingRoutes from '../modules/branding/branding.routes.js';
import customDomainRoutes from '../modules/customDomain/customDomain.routes.js';
import memberQrRoutes from '../modules/memberQr/memberQr.routes.js';

// Module Routes Registration
router.use('/auth', authRoutes);
router.use('/saas-plans', saasPlanRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/members', memberRoutes);
router.use('/membership-plans', membershipPlanRoutes);
router.use('/member-subscriptions', memberSubscriptionRoutes);
router.use('/payments', paymentRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/exercises', exerciseRoutes);
router.use('/workout-templates', workoutTemplateRoutes);
router.use('/workout-days', workoutDayRoutes);
router.use('/member-workouts', memberWorkoutRoutes);
router.use('/personal-workouts', personalWorkoutRoutes);
router.use('/message-templates', messageTemplateRoutes);
router.use('/broadcasts', broadcastRoutes);
router.use('/notifications', notificationRoutes);
router.use('/delivery-logs', deliveryLogRoutes);
router.use('/settings/branding', brandingRoutes);
router.use('/domains', customDomainRoutes);
router.use('/members/:id/qr', memberQrRoutes);

export default router;
