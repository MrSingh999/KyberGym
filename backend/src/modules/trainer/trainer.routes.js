import { Router } from 'express';
import { TrainerController } from './trainer.controller.js';
import { validateRequest } from '../../validators/validateRequest.js';
import {
  createTrainerSchema,
  updateTrainerSchema,
  assignMembersSchema,
  trainerQuerySchema,
  trainerMembersQuerySchema,
  updateMyProfileSchema,
} from './trainer.validators.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/role.middleware.js';
import { ROLES } from '../../shared/constants.js';

const router = Router();

router.use(asyncHandler(resolveTenant));
router.use(authenticate);

// ── Owner-only routes ──────────────────────────────────────
router.post(
  '/',
  requireRoles(ROLES.GYM_ADMIN),
  validateRequest(createTrainerSchema),
  asyncHandler(TrainerController.createTrainer)
);

router.get(
  '/',
  requireRoles(ROLES.GYM_ADMIN),
  validateRequest(trainerQuerySchema),
  asyncHandler(TrainerController.getTrainers)
);

router.get(
  '/:id',
  requireRoles(ROLES.GYM_ADMIN),
  asyncHandler(TrainerController.getTrainerById)
);

router.patch(
  '/:id',
  requireRoles(ROLES.GYM_ADMIN),
  validateRequest(updateTrainerSchema),
  asyncHandler(TrainerController.updateTrainer)
);

router.post(
  '/:id/deactivate',
  requireRoles(ROLES.GYM_ADMIN),
  asyncHandler(TrainerController.deactivateTrainer)
);

router.post(
  '/:id/activate',
  requireRoles(ROLES.GYM_ADMIN),
  asyncHandler(TrainerController.activateTrainer)
);

router.post(
  '/:id/assign-members',
  requireRoles(ROLES.GYM_ADMIN),
  validateRequest(assignMembersSchema),
  asyncHandler(TrainerController.assignMembers)
);

router.get(
  '/:id/members',
  requireRoles(ROLES.GYM_ADMIN),
  validateRequest(trainerMembersQuerySchema),
  asyncHandler(TrainerController.getTrainerMembers)
);

router.delete(
  '/:id/members/:assignmentId',
  requireRoles(ROLES.GYM_ADMIN),
  asyncHandler(TrainerController.removeMemberAssignment)
);

// ── Trainer self-service routes ────────────────────────────
router.get(
  '/me/profile',
  requireRoles(ROLES.TRAINER),
  asyncHandler(TrainerController.getMyProfile)
);

router.patch(
  '/me/profile',
  requireRoles(ROLES.TRAINER),
  validateRequest(updateMyProfileSchema),
  asyncHandler(TrainerController.updateMyProfile)
);

router.get(
  '/me/members',
  requireRoles(ROLES.TRAINER),
  validateRequest(trainerMembersQuerySchema),
  asyncHandler(TrainerController.getMyMembers)
);

export default router;
