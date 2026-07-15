import { Router } from 'express';
import { AttendanceController } from './attendance.controller.js';
import { validateRequest } from '../../validators/validateRequest.js';
import { markAttendanceSchema, updateAttendanceSchema } from './attendance.validators.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/role.middleware.js';
import { requireFeature } from '../../middleware/feature.middleware.js';
import { ROLES } from '../../shared/constants.js';

const router = Router();

router.use(asyncHandler(resolveTenant));
router.use(authenticate);
router.use(requireFeature('attendance'));

// Stats must come before /:id to avoid conflict
router.get('/stats', requireRoles(ROLES.GYM_ADMIN, ROLES.STAFF, ROLES.TRAINER), asyncHandler(AttendanceController.getAttendanceStats));

// Member-specific history
router.get('/members/:memberId', requireRoles(ROLES.GYM_ADMIN, ROLES.STAFF, ROLES.TRAINER, ROLES.MEMBER), asyncHandler(AttendanceController.getMemberAttendance));

// Read access
router.get('/', requireRoles(ROLES.GYM_ADMIN, ROLES.STAFF, ROLES.TRAINER), asyncHandler(AttendanceController.getAttendanceList));

// Write access
router.post(
  '/',
  requireRoles(ROLES.GYM_ADMIN, ROLES.STAFF),
  validateRequest(markAttendanceSchema),
  asyncHandler(AttendanceController.markAttendance)
);

router.patch(
  '/:id',
  requireRoles(ROLES.GYM_ADMIN, ROLES.STAFF),
  validateRequest(updateAttendanceSchema),
  asyncHandler(AttendanceController.updateAttendance)
);

export default router;
