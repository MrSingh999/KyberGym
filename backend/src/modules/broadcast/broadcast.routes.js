import { Router } from 'express';
import { BroadcastController } from './broadcast.controller.js';
import { validateRequest } from '../../validators/validateRequest.js';
import { createBroadcastSchema, updateBroadcastSchema } from './broadcast.validators.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/role.middleware.js';
import { requireFeature } from '../../middleware/feature.middleware.js';
import { ROLES } from '../../shared/constants.js';

const router = Router();

router.use(asyncHandler(resolveTenant));
router.use(authenticate);
router.use(requireFeature('whatsappBroadcast'));

// Access: Owner, Staff
const allowedRoles = [ROLES.GYM_ADMIN, ROLES.STAFF];

router.get('/', requireRoles(...allowedRoles), asyncHandler(BroadcastController.getBroadcasts));
router.get('/:id', requireRoles(...allowedRoles), asyncHandler(BroadcastController.getBroadcastById));

router.post(
  '/', 
  requireRoles(...allowedRoles), 
  validateRequest(createBroadcastSchema), 
  asyncHandler(BroadcastController.createBroadcast)
);

router.patch(
  '/:id', 
  requireRoles(...allowedRoles), 
  validateRequest(updateBroadcastSchema), 
  asyncHandler(BroadcastController.updateBroadcast)
);

router.delete('/:id', requireRoles(...allowedRoles), asyncHandler(BroadcastController.deleteBroadcast));

router.post('/:id/send', requireRoles(...allowedRoles), asyncHandler(BroadcastController.sendBroadcast));

export default router;
