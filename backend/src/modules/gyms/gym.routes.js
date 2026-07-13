import { Router } from 'express';
import { GymController } from './gym.controller.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/role.middleware.js';
import { ROLES } from '../../shared/constants.js';

const router = Router();

router.use(authenticate);

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
