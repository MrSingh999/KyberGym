import { Router } from 'express';
import { MemberWorkoutPlanController } from './memberWorkoutPlan.controller.js';
import { validateRequest } from '../../validators/validateRequest.js';
import {
  createPlanSchema,
  updatePlanSchema,
  planQuerySchema,
  nestedSaveSchema,
} from './memberWorkoutPlan.validators.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/role.middleware.js';
import { ROLES } from '../../shared/constants.js';

const router = Router();

router.use(asyncHandler(resolveTenant));
router.use(authenticate);

// ── Owner & Trainer routes ────────────────────────────────────
router.get(
  '/',
  requireRoles(ROLES.GYM_ADMIN, ROLES.TRAINER),
  validateRequest(planQuerySchema),
  asyncHandler(MemberWorkoutPlanController.getPlans)
);

router.get(
  '/my',
  requireRoles(ROLES.TRAINER),
  validateRequest(planQuerySchema),
  asyncHandler(MemberWorkoutPlanController.getMyPlans)
);

router.get(
  '/trainer/:trainerId',
  requireRoles(ROLES.GYM_ADMIN),
  validateRequest(planQuerySchema),
  asyncHandler(MemberWorkoutPlanController.getPlansByTrainer)
);

router.get(
  '/member/:memberId',
  requireRoles(ROLES.GYM_ADMIN, ROLES.TRAINER),
  validateRequest(planQuerySchema),
  asyncHandler(MemberWorkoutPlanController.getPlansByMember)
);

router.post(
  '/',
  requireRoles(ROLES.TRAINER, ROLES.GYM_ADMIN),
  validateRequest(createPlanSchema),
  asyncHandler(MemberWorkoutPlanController.createPlan)
);

router.get(
  '/:id',
  requireRoles(ROLES.GYM_ADMIN, ROLES.TRAINER),
  asyncHandler(MemberWorkoutPlanController.getPlanById)
);

router.patch(
  '/:id',
  requireRoles(ROLES.TRAINER, ROLES.GYM_ADMIN),
  validateRequest(updatePlanSchema),
  asyncHandler(MemberWorkoutPlanController.updatePlan)
);

router.put(
  '/:id/nested',
  requireRoles(ROLES.TRAINER, ROLES.GYM_ADMIN),
  validateRequest(nestedSaveSchema),
  asyncHandler(MemberWorkoutPlanController.saveNested)
);

router.post(
  '/:id/archive',
  requireRoles(ROLES.TRAINER, ROLES.GYM_ADMIN),
  asyncHandler(MemberWorkoutPlanController.archivePlan)
);

export default router;
