import { Router } from 'express';
import { WorkoutDayController } from './workoutDay.controller.js';
import { validateRequest } from '../../validators/validateRequest.js';
import { createWorkoutDaySchema, updateWorkoutDaySchema } from './workoutDay.validators.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/role.middleware.js';
import { requireActiveSubscription } from '../../middleware/subscription.middleware.js';
import { ROLES } from '../../shared/constants.js';

const router = Router();

router.use(asyncHandler(resolveTenant));
router.use(authenticate);
router.use(asyncHandler(requireActiveSubscription));

// Read access
router.get('/', requireRoles(ROLES.GYM_ADMIN, ROLES.TRAINER, ROLES.STAFF), asyncHandler(WorkoutDayController.getDaysByTemplate));
router.get('/:id', requireRoles(ROLES.GYM_ADMIN, ROLES.TRAINER, ROLES.STAFF), asyncHandler(WorkoutDayController.getDayById));

// Write access
router.post(
  '/', 
  requireRoles(ROLES.GYM_ADMIN, ROLES.TRAINER), 
  validateRequest(createWorkoutDaySchema), 
  asyncHandler(WorkoutDayController.createDay)
);

router.patch(
  '/:id', 
  requireRoles(ROLES.GYM_ADMIN, ROLES.TRAINER), 
  validateRequest(updateWorkoutDaySchema), 
  asyncHandler(WorkoutDayController.updateDay)
);

router.delete('/:id', requireRoles(ROLES.GYM_ADMIN, ROLES.TRAINER), asyncHandler(WorkoutDayController.deleteDay));

export default router;
