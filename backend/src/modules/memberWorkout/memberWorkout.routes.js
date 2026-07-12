import { Router } from 'express';
import { MemberWorkoutController } from './memberWorkout.controller.js';
import { validateRequest } from '../../validators/validateRequest.js';
import { assignWorkoutSchema, updateWorkoutStatusSchema } from './memberWorkout.validators.js';
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
router.get('/', requireRoles(ROLES.GYM_ADMIN, ROLES.TRAINER, ROLES.STAFF), asyncHandler(MemberWorkoutController.getWorkouts));
router.get('/:id', requireRoles(ROLES.GYM_ADMIN, ROLES.TRAINER, ROLES.STAFF), asyncHandler(MemberWorkoutController.getWorkoutById));

// Write access (Trainers and Admins can assign workouts)
router.post(
  '/', 
  requireRoles(ROLES.GYM_ADMIN, ROLES.TRAINER), 
  validateRequest(assignWorkoutSchema), 
  asyncHandler(MemberWorkoutController.assignWorkout)
);

router.patch(
  '/:id/status', 
  requireRoles(ROLES.GYM_ADMIN, ROLES.TRAINER), 
  validateRequest(updateWorkoutStatusSchema), 
  asyncHandler(MemberWorkoutController.updateStatus)
);

export default router;
