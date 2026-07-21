import { Router } from 'express';
import { MemberPaymentController } from './memberPayment.controller.js';
import { validateRequest } from '../../validators/validateRequest.js';
import { createPaymentSchema } from './memberPayment.validators.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/role.middleware.js';
import { ROLES } from '../../shared/constants.js';

const router = Router();

router.use(asyncHandler(resolveTenant));
router.use(authenticate);

router.get('/', requireRoles(ROLES.GYM_ADMIN, ROLES.STAFF), asyncHandler(MemberPaymentController.getPayments));
router.get('/:id', requireRoles(ROLES.GYM_ADMIN, ROLES.STAFF), asyncHandler(MemberPaymentController.getPaymentById));

router.post(
  '/', 
  requireRoles(ROLES.GYM_ADMIN, ROLES.STAFF), 
  validateRequest(createPaymentSchema), 
  asyncHandler(MemberPaymentController.recordPayment)
);

router.post(
  '/:id/refund', 
  requireRoles(ROLES.GYM_ADMIN), 
  asyncHandler(MemberPaymentController.refundPayment)
);

export default router;
