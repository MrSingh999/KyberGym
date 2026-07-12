import { Router } from 'express';
import { DashboardController } from './dashboard.controller.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/role.middleware.js';
import { requireActiveSubscription } from '../../middleware/subscription.middleware.js';
import { ROLES } from '../../shared/constants.js';

const router = Router();

router.use(asyncHandler(resolveTenant));
router.use(authenticate);
router.use(asyncHandler(requireActiveSubscription));

// Owners and Staff can view dashboard
router.get('/overview', requireRoles(ROLES.GYM_ADMIN, ROLES.STAFF), asyncHandler(DashboardController.getOverviewStats));
router.get('/due-tracking', requireRoles(ROLES.GYM_ADMIN, ROLES.STAFF), asyncHandler(DashboardController.getDueTracking));

export default router;
