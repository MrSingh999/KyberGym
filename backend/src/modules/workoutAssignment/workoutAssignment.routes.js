import { Router } from 'express';
import { WorkoutAssignmentController } from './workoutAssignment.controller.js';
import { validateRequest } from '../../validators/validateRequest.js';
import {
  assignWorkoutSchema,
  updateAssignmentSchema,
  assignmentQuerySchema,
} from './workoutAssignment.validators.js';
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

const ownerRoles = [ROLES.GYM_ADMIN];

// ── Assignments ─────────────────────────────────────────────
router.post(
  '/',
  requireRoles(...ownerRoles),
  validateRequest(assignWorkoutSchema),
  asyncHandler(WorkoutAssignmentController.assignWorkout)
);

router.get(
  '/',
  requireRoles(...ownerRoles),
  validateRequest(assignmentQuerySchema),
  asyncHandler(WorkoutAssignmentController.getAssignments)
);

router.get(
  '/:id',
  requireRoles(...ownerRoles),
  asyncHandler(WorkoutAssignmentController.getAssignmentById)
);

router.patch(
  '/:id',
  requireRoles(...ownerRoles),
  validateRequest(updateAssignmentSchema),
  asyncHandler(WorkoutAssignmentController.updateAssignment)
);

router.delete(
  '/:id',
  requireRoles(...ownerRoles),
  asyncHandler(WorkoutAssignmentController.removeAssignment)
);

// ── Member-specific ────────────────────────────────────────
router.get(
  '/member/:memberId',
  requireRoles(...ownerRoles),
  asyncHandler(WorkoutAssignmentController.getMemberAssignments)
);

export default router;
