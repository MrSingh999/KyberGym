import { Router } from 'express';
import { SubscriptionController } from './subscription.controller.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/role.middleware.js';
import { ROLES } from '../../../shared/constants.js';

const router = Router();

// Subscriptions are strictly tied to a Tenant and require auth
router.use(asyncHandler(resolveTenant));
router.use(authenticate);

// Only Owners and SuperAdmins can view subscription details
router.use(requireRoles(ROLES.GYM_ADMIN, ROLES.SUPER_ADMIN));

router.get('/current', asyncHandler(SubscriptionController.getCurrentSubscription));

export default router;
