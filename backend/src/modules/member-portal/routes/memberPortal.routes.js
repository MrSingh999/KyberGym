import { Router } from 'express';
import { MemberPortalController } from '../controllers/memberPortal.controller.js';
import { asyncHandler } from '../../../middleware/asyncHandler.js';
import { resolveTenant } from '../../../middleware/tenant.middleware.js';
import { authenticate } from '../../../middleware/authenticate.js';
import { requireRoles } from '../../../middleware/role.middleware.js';
import { ROLES } from '../../../shared/constants.js';

const router = Router();

router.use(asyncHandler(resolveTenant));
router.use(authenticate);
router.use(requireRoles(ROLES.MEMBER));

router.get('/me/home', asyncHandler(MemberPortalController.getHome));

export default router;
