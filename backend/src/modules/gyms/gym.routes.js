import { Router } from 'express';
import { GymController } from './gym.controller.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/role.middleware.js';
import { requireFeature } from '../../middleware/feature.middleware.js';
import { ROLES } from '../../shared/constants.js';

const router = Router();

router.use(asyncHandler(resolveTenant));
router.use(authenticate);

// Gym self-management (for gym admin / staff panel)
router.get(
  '/me',
  requireRoles(ROLES.GYM_ADMIN, ROLES.STAFF),
  asyncHandler(GymController.getMyGym)
);

router.patch(
  '/me',
  requireRoles(ROLES.GYM_ADMIN),
  asyncHandler(GymController.updateMyGym)
);

router.get(
  '/:gymId',
  asyncHandler(GymController.getGymById)
);

// Branding routes (require branding feature flag)
router.use(requireFeature('branding'));

router.get(
  '/:gymId/branding',
  requireRoles(ROLES.SUPER_ADMIN, ROLES.GYM_ADMIN),
  asyncHandler(GymController.getBranding)
);

router.patch(
  '/:gymId/branding',
  requireRoles(ROLES.SUPER_ADMIN),
  asyncHandler(GymController.updateBranding)
);

export default router;
