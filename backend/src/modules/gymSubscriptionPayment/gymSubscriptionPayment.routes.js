import { Router } from 'express';
import { GymSubscriptionPaymentController } from './gymSubscriptionPayment.controller.js';
import { validateRequest } from '../../validators/validateRequest.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { authenticateSuperAdmin } from '../super-admin/superAdmin.middleware.js';
import {
  gymPaymentPublicIdSchema,
  createGymPaymentSchema,
  updateGymPaymentSchema,
  refundGymPaymentSchema,
  gymPaymentQuerySchema,
} from './gymSubscriptionPayment.validators.js';

const router = Router();

router.use(authenticateSuperAdmin);

router.get(
  '/',
  validateRequest(gymPaymentQuerySchema),
  asyncHandler(GymSubscriptionPaymentController.getPayments)
);

router.get(
  '/:id',
  validateRequest(gymPaymentPublicIdSchema),
  asyncHandler(GymSubscriptionPaymentController.getPaymentById)
);

router.post(
  '/',
  validateRequest(createGymPaymentSchema),
  asyncHandler(GymSubscriptionPaymentController.createPayment)
);

router.patch(
  '/:id',
  validateRequest(gymPaymentPublicIdSchema),
  validateRequest(updateGymPaymentSchema),
  asyncHandler(GymSubscriptionPaymentController.updatePayment)
);

router.post(
  '/:id/refund',
  validateRequest(gymPaymentPublicIdSchema),
  validateRequest(refundGymPaymentSchema),
  asyncHandler(GymSubscriptionPaymentController.refundPayment)
);

router.delete(
  '/:id',
  validateRequest(gymPaymentPublicIdSchema),
  asyncHandler(GymSubscriptionPaymentController.deletePayment)
);

export default router;
