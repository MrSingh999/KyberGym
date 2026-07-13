import { Router } from 'express';
import { MemberSubscriptionController } from './memberSubscription.controller.js';
import { validateRequest } from '../../validators/validateRequest.js';
import { createSubscriptionSchema, updateSubscriptionStatusSchema } from './memberSubscription.validators.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/role.middleware.js';
import { ROLES } from '../../shared/constants.js';

const router = Router();

router.use(asyncHandler(resolveTenant));
router.use(authenticate);

// Read access: Owner, Staff, Trainer
router.get('/', requireRoles(ROLES.GYM_ADMIN, ROLES.STAFF, ROLES.TRAINER), asyncHandler(MemberSubscriptionController.getSubscriptions));
router.get('/:id', requireRoles(ROLES.GYM_ADMIN, ROLES.STAFF, ROLES.TRAINER), asyncHandler(MemberSubscriptionController.getSubscriptionById));

// Write access: Owner, Staff
router.post(
  '/', 
  requireRoles(ROLES.GYM_ADMIN, ROLES.STAFF), 
  validateRequest(createSubscriptionSchema), 
  asyncHandler(MemberSubscriptionController.createSubscription)
);

router.patch(
  '/:id/status', 
  requireRoles(ROLES.GYM_ADMIN, ROLES.STAFF), 
  validateRequest(updateSubscriptionStatusSchema), 
  asyncHandler(MemberSubscriptionController.updateStatus)
);

export default router;
