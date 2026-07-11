import { Router } from 'express';
import { CustomDomainController } from './customDomain.controller.js';
import { validateRequest } from '../../validators/validateRequest.js';
import { createCustomDomainSchema } from './customDomain.validators.js';
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

// Only Gym Admin can manage Custom Domains
const requireAdmin = requireRoles(ROLES.GYM_ADMIN);

router.get('/', requireAdmin, asyncHandler(CustomDomainController.getDomain));
router.post('/', requireAdmin, validateRequest(createCustomDomainSchema), asyncHandler(CustomDomainController.requestDomain));
router.delete('/', requireAdmin, asyncHandler(CustomDomainController.deleteDomain));
router.post('/verify', requireAdmin, asyncHandler(CustomDomainController.verifyDomain));

export default router;
