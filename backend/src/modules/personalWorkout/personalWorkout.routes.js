import { Router } from 'express';
import { PersonalWorkoutController } from './personalWorkout.controller.js';
import { validateRequest } from '../../validators/validateRequest.js';
import { createPersonalWorkoutSchema, updatePersonalWorkoutSchema } from './personalWorkout.validators.js';
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
router.get('/', requireRoles(ROLES.GYM_ADMIN, ROLES.TRAINER, ROLES.STAFF), asyncHandler(PersonalWorkoutController.getWorkouts));
router.get('/:id', requireRoles(ROLES.GYM_ADMIN, ROLES.TRAINER, ROLES.STAFF), asyncHandler(PersonalWorkoutController.getWorkoutById));

// Write access (Trainers and Admins can create custom plans)
router.post(
  '/', 
  requireRoles(ROLES.GYM_ADMIN, ROLES.TRAINER), 
  validateRequest(createPersonalWorkoutSchema), 
  asyncHandler(PersonalWorkoutController.createWorkout)
);

router.patch(
  '/:id', 
  requireRoles(ROLES.GYM_ADMIN, ROLES.TRAINER), 
  validateRequest(updatePersonalWorkoutSchema), 
  asyncHandler(PersonalWorkoutController.updateWorkout)
);

router.delete('/:id', requireRoles(ROLES.GYM_ADMIN, ROLES.TRAINER), asyncHandler(PersonalWorkoutController.deleteWorkout));

export default router;
