import { Router } from 'express';
import { MembershipPlanController } from './membershipPlan.controller.js';
import { validateRequest } from '../../validators/validateRequest.js';
import { createPlanSchema, updatePlanSchema } from './membershipPlan.validators.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/role.middleware.js';
import { requireActiveSubscription } from '../../middleware/subscription.middleware.js';
import { ROLES } from '../../shared/constants.js';

const router = Router();

// 1. Resolve Tenant
router.use(asyncHandler(resolveTenant));

// 2. Authenticate User
router.use(authenticate);

// 3. Verify Active SaaS Subscription (blocks mutations if expired)
router.use(asyncHandler(requireActiveSubscription));

// Routes
// Read access: Owner, Staff, Trainer
router.get('/', requireRoles(ROLES.GYM_ADMIN, ROLES.STAFF, ROLES.TRAINER), asyncHandler(MembershipPlanController.getPlans));
router.get('/:id', requireRoles(ROLES.GYM_ADMIN, ROLES.STAFF, ROLES.TRAINER), asyncHandler(MembershipPlanController.getPlanById));

// Write access: Owner, Staff
router.post(
  '/', 
  requireRoles(ROLES.GYM_ADMIN, ROLES.STAFF), 
  validateRequest(createPlanSchema), 
  asyncHandler(MembershipPlanController.createPlan)
);

router.patch(
  '/:id', 
  requireRoles(ROLES.GYM_ADMIN, ROLES.STAFF), 
  validateRequest(updatePlanSchema), 
  asyncHandler(MembershipPlanController.updatePlan)
);

router.delete('/:id', requireRoles(ROLES.GYM_ADMIN, ROLES.STAFF), asyncHandler(MembershipPlanController.deletePlan));

export default router;
