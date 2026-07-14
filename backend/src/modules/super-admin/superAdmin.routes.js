import { Router } from 'express';
import { SuperAdminController } from './superAdmin.controller.js';
import { validateRequest } from '../../validators/validateRequest.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { authenticateSuperAdmin } from './superAdmin.middleware.js';
import {
  loginSchema,
  createGymSchema,
  updateGymSchema,
  updateFeaturesSchema,
  getSubscriptionSchema,
  updateSubscriptionSchema,
  renewSubscriptionSchema,
  updateStatusSchema,
  manageTrialSchema,
  gymIdParamSchema,
  paginationSchema,
} from './superAdmin.validation.js';

const router = Router();

router.post(
  '/login',
  validateRequest(loginSchema),
  asyncHandler(SuperAdminController.login)
);

router.use(authenticateSuperAdmin);

router.get(
  '/me',
  asyncHandler(SuperAdminController.getProfile)
);

router.get(
  '/dashboard',
  asyncHandler(SuperAdminController.getDashboard)
);

router.get(
  '/gyms',
  validateRequest(paginationSchema),
  asyncHandler(SuperAdminController.getGyms)
);

router.get(
  '/gyms/:id',
  validateRequest(gymIdParamSchema),
  asyncHandler(SuperAdminController.getGymById)
);

router.post(
  '/gyms',
  validateRequest(createGymSchema),
  asyncHandler(SuperAdminController.createGym)
);

router.patch(
  '/gyms/:id',
  validateRequest(updateGymSchema),
  asyncHandler(SuperAdminController.updateGym)
);

router.delete(
  '/gyms/:id',
  validateRequest(gymIdParamSchema),
  asyncHandler(SuperAdminController.deleteGym)
);

router.patch(
  '/gyms/:id/suspend',
  validateRequest(gymIdParamSchema),
  asyncHandler(SuperAdminController.suspendGym)
);

router.patch(
  '/gyms/:id/activate',
  validateRequest(gymIdParamSchema),
  asyncHandler(SuperAdminController.activateGym)
);

router.patch(
  '/gyms/:id/features',
  validateRequest(updateFeaturesSchema),
  asyncHandler(SuperAdminController.updateFeatures)
);

router.get(
  '/gyms/:id/subscription',
  validateRequest(getSubscriptionSchema),
  asyncHandler(SuperAdminController.getSubscription)
);

router.patch(
  '/gyms/:id/subscription',
  validateRequest(updateSubscriptionSchema),
  asyncHandler(SuperAdminController.updateSubscription)
);

router.patch(
  '/gyms/:id/renew',
  validateRequest(renewSubscriptionSchema),
  asyncHandler(SuperAdminController.renewSubscription)
);

router.patch(
  '/gyms/:id/status',
  validateRequest(updateStatusSchema),
  asyncHandler(SuperAdminController.updateSubscriptionStatus)
);

router.patch(
  '/gyms/:id/trial',
  validateRequest(manageTrialSchema),
  asyncHandler(SuperAdminController.manageTrial)
);

export default router;
