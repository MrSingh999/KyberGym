import { Router } from 'express';
import { MemberQrController } from './memberQr.controller.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/role.middleware.js';
import { requireActiveSubscription } from '../../middleware/subscription.middleware.js';
import { ROLES } from '../../shared/constants.js';

const router = Router({ mergeParams: true }); // Need mergeParams if mounted on /members/:id/qr

router.use(asyncHandler(resolveTenant));
router.use(authenticate);
router.use(asyncHandler(requireActiveSubscription));

const allowedRoles = [ROLES.GYM_ADMIN, ROLES.STAFF];

router.get('/', requireRoles(...allowedRoles), asyncHandler(MemberQrController.getQr));
router.post('/', requireRoles(...allowedRoles), asyncHandler(MemberQrController.generateQr));
router.patch('/regenerate', requireRoles(...allowedRoles), asyncHandler(MemberQrController.regenerateQr));

export default router;
