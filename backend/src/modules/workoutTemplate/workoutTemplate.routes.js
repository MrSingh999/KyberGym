import { Router } from 'express';
import { WorkoutTemplateController } from './workoutTemplate.controller.js';
import { validateRequest } from '../../validators/validateRequest.js';
import { createWorkoutTemplateSchema, updateWorkoutTemplateSchema } from './workoutTemplate.validators.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/role.middleware.js';
import { requireActiveSubscription } from '../../middleware/subscription.middleware.js';
import { ROLES } from '../../../shared/constants.js';

const router = Router();

router.use(asyncHandler(resolveTenant));
router.use(authenticate);
router.use(asyncHandler(requireActiveSubscription));

// Read access: Owner, Trainer, Staff
router.get('/', requireRoles(ROLES.GYM_ADMIN, ROLES.TRAINER, ROLES.STAFF), asyncHandler(WorkoutTemplateController.getTemplates));
router.get('/:id', requireRoles(ROLES.GYM_ADMIN, ROLES.TRAINER, ROLES.STAFF), asyncHandler(WorkoutTemplateController.getTemplateById));

// Write access: Owner, Trainer
router.post(
  '/', 
  requireRoles(ROLES.GYM_ADMIN, ROLES.TRAINER), 
  validateRequest(createWorkoutTemplateSchema), 
  asyncHandler(WorkoutTemplateController.createTemplate)
);

router.patch(
  '/:id', 
  requireRoles(ROLES.GYM_ADMIN, ROLES.TRAINER), 
  validateRequest(updateWorkoutTemplateSchema), 
  asyncHandler(WorkoutTemplateController.updateTemplate)
);

router.delete('/:id', requireRoles(ROLES.GYM_ADMIN, ROLES.TRAINER), asyncHandler(WorkoutTemplateController.deleteTemplate));

export default router;
