import { Router } from 'express';
import { DeliveryLogController } from './deliveryLog.controller.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/role.middleware.js';
import { ROLES } from '../../../shared/constants.js';

const router = Router();

router.use(asyncHandler(resolveTenant));
router.use(authenticate);

// Read-only access for admins and staff
router.get('/', requireRoles(ROLES.GYM_ADMIN, ROLES.STAFF), asyncHandler(DeliveryLogController.getLogs));
router.get('/:id', requireRoles(ROLES.GYM_ADMIN, ROLES.STAFF), asyncHandler(DeliveryLogController.getLogById));

export default router;
