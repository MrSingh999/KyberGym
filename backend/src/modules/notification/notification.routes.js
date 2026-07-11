import { Router } from 'express';
import { NotificationController } from './notification.controller.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();

router.use(asyncHandler(resolveTenant));
router.use(authenticate);

// All authenticated users can access their own notifications
router.get('/', asyncHandler(NotificationController.getNotifications));
router.patch('/read-all', asyncHandler(NotificationController.markAllAsRead));
router.patch('/:id/read', asyncHandler(NotificationController.markAsRead));

export default router;
