import { Router } from 'express';
import { SaasPlanController } from './saasPlan.controller.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/role.middleware.js';
import { ROLES } from '../../../shared/constants.js';

const router = Router();

// Public route to view plans (e.g. for marketing site)
router.get('/', asyncHandler(SaasPlanController.getPlans));

// Protect all other routes for SuperAdmins only
router.use(authenticate);
router.use(requireRoles(ROLES.SUPER_ADMIN));

router.post('/', asyncHandler(SaasPlanController.createPlan));
router.put('/:id', asyncHandler(SaasPlanController.updatePlan));
router.delete('/:id', asyncHandler(SaasPlanController.deletePlan));

export default router;
