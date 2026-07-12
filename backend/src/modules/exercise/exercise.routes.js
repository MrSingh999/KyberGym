import { Router } from 'express';
import { ExerciseController } from './exercise.controller.js';
import { validateRequest } from '../../validators/validateRequest.js';
import { createExerciseSchema, updateExerciseSchema } from './exercise.validators.js';
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

// Read access: Owner, Trainer, Staff
router.get('/', requireRoles(ROLES.GYM_ADMIN, ROLES.TRAINER, ROLES.STAFF), asyncHandler(ExerciseController.getExercises));
router.get('/:id', requireRoles(ROLES.GYM_ADMIN, ROLES.TRAINER, ROLES.STAFF), asyncHandler(ExerciseController.getExerciseById));

// Write access: Owner, Trainer
router.post(
  '/', 
  requireRoles(ROLES.GYM_ADMIN, ROLES.TRAINER), 
  validateRequest(createExerciseSchema), 
  asyncHandler(ExerciseController.createExercise)
);

router.patch(
  '/:id', 
  requireRoles(ROLES.GYM_ADMIN, ROLES.TRAINER), 
  validateRequest(updateExerciseSchema), 
  asyncHandler(ExerciseController.updateExercise)
);

router.delete('/:id', requireRoles(ROLES.GYM_ADMIN, ROLES.TRAINER), asyncHandler(ExerciseController.deleteExercise));

export default router;
