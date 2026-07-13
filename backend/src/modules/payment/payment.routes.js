import { Router } from 'express';
import { PaymentController } from './payment.controller.js';
import { validateRequest } from '../../validators/validateRequest.js';
import { createPaymentSchema, updatePaymentStatusSchema } from './payment.validators.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/role.middleware.js';
import { requireFeature } from '../../middleware/feature.middleware.js';
import { ROLES } from '../../shared/constants.js';

const router = Router();

router.use(asyncHandler(resolveTenant));
router.use(authenticate);
router.use(requireFeature('payments'));

// Read access: Owner, Staff
router.get('/', requireRoles(ROLES.GYM_ADMIN, ROLES.STAFF), asyncHandler(PaymentController.getPayments));
router.get('/:id', requireRoles(ROLES.GYM_ADMIN, ROLES.STAFF), asyncHandler(PaymentController.getPaymentById));

// Write access: Owner, Staff
router.post(
  '/', 
  requireRoles(ROLES.GYM_ADMIN, ROLES.STAFF), 
  validateRequest(createPaymentSchema), 
  asyncHandler(PaymentController.recordPayment)
);

// Refund requires higher privileges (Owner only usually, but allowed Staff for now based on gym rules)
router.post(
  '/:id/refund', 
  requireRoles(ROLES.GYM_ADMIN), 
  asyncHandler(PaymentController.refundPayment)
);

export default router;
