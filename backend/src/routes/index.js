import { Router } from 'express';
import httpStatus from 'http-status';
import { env } from '../config/env.js';

const router = Router();

// Health Check Route
router.get('/health', (req, res) => {
  res.status(httpStatus.OK).json({
    status: 'UP',
    uptime: process.uptime(),
    environment: env.NODE_ENV,
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ── Module Route Imports ───────────────────────────────────────────────────
import authRoutes            from '../modules/auth/auth.routes.js';
import memberRoutes          from '../modules/member/member.routes.js';
import membershipPlanRoutes  from '../modules/membershipPlan/membershipPlan.routes.js';
import memberSubscriptionRoutes from '../modules/memberSubscription/memberSubscription.routes.js';
import memberPaymentRoutes  from '../modules/memberPayment/memberPayment.routes.js';
import dashboardRoutes       from '../modules/dashboard/dashboard.routes.js';
import workoutRoutes         from '../modules/workouts/workout.routes.js';
import messageTemplateRoutes from '../modules/messageTemplate/messageTemplate.routes.js';
import broadcastRoutes       from '../modules/broadcast/broadcast.routes.js';
import notificationRoutes    from '../modules/notification/notification.routes.js';
import deliveryLogRoutes     from '../modules/deliveryLog/deliveryLog.routes.js';
import gymRoutes             from '../modules/gyms/gym.routes.js';
import userRoutes            from '../modules/users/users.routes.js';
import memberQrRoutes        from '../modules/memberQr/memberQr.routes.js';
import superAdminRoutes      from '../modules/super-admin/superAdmin.routes.js';
import attendanceRoutes      from '../modules/attendance/attendance.routes.js';
import gymSubscriptionPaymentRoutes from '../modules/gymSubscriptionPayment/gymSubscriptionPayment.routes.js';
import workoutAssignmentRoutes from '../modules/workoutAssignment/workoutAssignment.routes.js';
import trainerRoutes from '../modules/trainer/trainer.routes.js';
import memberWorkoutPlanRoutes from '../modules/memberWorkoutPlan/memberWorkoutPlan.routes.js';
import memberPortalRoutes from '../modules/member-portal/routes/memberPortal.routes.js';

// ── Route Registration ─────────────────────────────────────────────────────
router.use('/super-admin',               superAdminRoutes);
router.use('/gym-subscription-payments', gymSubscriptionPaymentRoutes);
router.use('/auth',               authRoutes);
router.use('/members',            memberRoutes);
router.use('/members',            memberPortalRoutes);
router.use('/membership-plans',   membershipPlanRoutes);
router.use('/member-subscriptions', memberSubscriptionRoutes);
router.use('/member-payments',    memberPaymentRoutes);
router.use('/dashboard',          dashboardRoutes);
router.use('/workouts',           workoutRoutes);
router.use('/message-templates',  messageTemplateRoutes);
router.use('/broadcasts',         broadcastRoutes);
router.use('/notifications',      notificationRoutes);
router.use('/delivery-logs',      deliveryLogRoutes);
router.use('/gyms',               gymRoutes);
router.use('/users',              userRoutes);
router.use('/members/:id/qr',     memberQrRoutes);
router.use('/attendance',         attendanceRoutes);
router.use('/workout-assignments', workoutAssignmentRoutes);
router.use('/trainers', trainerRoutes);
router.use('/member-workout-plans', memberWorkoutPlanRoutes);

export default router;
