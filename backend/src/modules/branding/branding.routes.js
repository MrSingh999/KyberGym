import { Router } from 'express';
import { BrandingController } from './branding.controller.js';
import { validateRequest } from '../../validators/validateRequest.js';
import { updateBrandingSchema } from './branding.validators.js';
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

// Read access for Staff & Owner
router.get('/', requireRoles(ROLES.GYM_ADMIN, ROLES.STAFF), asyncHandler(BrandingController.getBranding));

// Write access for Staff & Owner
router.patch(
  '/', 
  requireRoles(ROLES.GYM_ADMIN, ROLES.STAFF), 
  validateRequest(updateBrandingSchema), 
  asyncHandler(BrandingController.updateBranding)
);

export default router;
