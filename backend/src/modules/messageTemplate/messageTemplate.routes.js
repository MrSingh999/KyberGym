import { Router } from 'express';
import { MessageTemplateController } from './messageTemplate.controller.js';
import { validateRequest } from '../../validators/validateRequest.js';
import { createMessageTemplateSchema, updateMessageTemplateSchema } from './messageTemplate.validators.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/role.middleware.js';
import { requireFeature } from '../../middleware/feature.middleware.js';
import { ROLES } from '../../shared/constants.js';

const router = Router();

router.use(asyncHandler(resolveTenant));
router.use(authenticate);
router.use(requireFeature('whatsappBroadcast'));

// Read access: Owner, Staff
router.get('/', requireRoles(ROLES.GYM_ADMIN, ROLES.STAFF), asyncHandler(MessageTemplateController.getTemplates));
router.get('/:id', requireRoles(ROLES.GYM_ADMIN, ROLES.STAFF), asyncHandler(MessageTemplateController.getTemplateById));

// Write access: Owner only
router.post(
  '/', 
  requireRoles(ROLES.GYM_ADMIN), 
  validateRequest(createMessageTemplateSchema), 
  asyncHandler(MessageTemplateController.createTemplate)
);

router.patch(
  '/:id', 
  requireRoles(ROLES.GYM_ADMIN), 
  validateRequest(updateMessageTemplateSchema), 
  asyncHandler(MessageTemplateController.updateTemplate)
);

router.delete('/:id', requireRoles(ROLES.GYM_ADMIN), asyncHandler(MessageTemplateController.deleteTemplate));

export default router;
