import { Router } from 'express';
import { MemberController } from './member.controller.js';
import { validateRequest } from '../../validators/validateRequest.js';
import { createMemberSchema, updateMemberSchema } from './member.validators.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/role.middleware.js';
import { ROLES } from '../../shared/constants.js';

const router = Router();

router.use(asyncHandler(resolveTenant));
router.use(authenticate);

// Member self-service routes (must be before /:id to avoid conflicts)
router.get('/me/workouts', requireRoles(ROLES.MEMBER), asyncHandler(MemberController.getMyWorkouts));
router.get('/me/qr', requireRoles(ROLES.MEMBER), asyncHandler(MemberController.getMyQr));

// Read access: Owner, Staff, Trainer
router.get('/', requireRoles(ROLES.GYM_ADMIN, ROLES.STAFF, ROLES.TRAINER), asyncHandler(MemberController.getMembers));
router.get('/:id', requireRoles(ROLES.GYM_ADMIN, ROLES.STAFF, ROLES.TRAINER), asyncHandler(MemberController.getMemberById));

// Write access: Owner, Staff
router.post(
  '/',
  requireRoles(ROLES.GYM_ADMIN, ROLES.STAFF),
  validateRequest(createMemberSchema),
  asyncHandler(MemberController.createMember)
);

router.patch(
  '/:id',
  requireRoles(ROLES.GYM_ADMIN, ROLES.STAFF),
  validateRequest(updateMemberSchema),
  asyncHandler(MemberController.updateMember)
);

router.delete('/:id', requireRoles(ROLES.GYM_ADMIN, ROLES.STAFF), asyncHandler(MemberController.deleteMember));

export default router;
