import { Router } from 'express';
import { WorkoutController } from './workout.controller.js';
import { validateRequest } from '../../validators/validateRequest.js';
import {
  createWorkoutSchema,
  updateWorkoutSchema,
  createWorkoutDaySchema,
  updateWorkoutDaySchema,
} from './workout.validators.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/role.middleware.js';
import { requireFeature } from '../../middleware/feature.middleware.js';
import { ROLES } from '../../shared/constants.js';

const router = Router();

router.use(asyncHandler(resolveTenant));
router.use(authenticate);
router.use(requireFeature('workouts'));

// ── Workout CRUD ──────────────────────────────────────────────
router.get(
  '/',
  requireRoles(ROLES.GYM_ADMIN, ROLES.STAFF, ROLES.TRAINER),
  asyncHandler(WorkoutController.getWorkouts)
);

router.get(
  '/:id',
  requireRoles(ROLES.GYM_ADMIN, ROLES.STAFF, ROLES.TRAINER),
  asyncHandler(WorkoutController.getWorkoutById)
);

router.post(
  '/',
  requireRoles(ROLES.GYM_ADMIN, ROLES.TRAINER),
  validateRequest(createWorkoutSchema),
  asyncHandler(WorkoutController.createWorkout)
);

router.patch(
  '/:id',
  requireRoles(ROLES.GYM_ADMIN, ROLES.TRAINER),
  validateRequest(updateWorkoutSchema),
  asyncHandler(WorkoutController.updateWorkout)
);

router.delete(
  '/:id',
  requireRoles(ROLES.GYM_ADMIN),
  asyncHandler(WorkoutController.deleteWorkout)
);

// ── Workout Day Sub-Routes ────────────────────────────────────
router.post(
  '/:id/days',
  requireRoles(ROLES.GYM_ADMIN, ROLES.TRAINER),
  validateRequest(createWorkoutDaySchema),
  asyncHandler(WorkoutController.createDay)
);

router.patch(
  '/:id/days/:dayId',
  requireRoles(ROLES.GYM_ADMIN, ROLES.TRAINER),
  validateRequest(updateWorkoutDaySchema),
  asyncHandler(WorkoutController.updateDay)
);

router.delete(
  '/:id/days/:dayId',
  requireRoles(ROLES.GYM_ADMIN, ROLES.TRAINER),
  asyncHandler(WorkoutController.deleteDay)
);

export default router;
