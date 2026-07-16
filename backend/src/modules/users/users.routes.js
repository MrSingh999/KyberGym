import { Router } from 'express';
import { UserController } from './users.controller.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/role.middleware.js';
import { ROLES } from '../../shared/constants.js';

const router = Router();

router.use(asyncHandler(resolveTenant));
router.use(authenticate);
router.use(requireRoles(ROLES.GYM_ADMIN));

router.get('/', asyncHandler(UserController.listUsers));
router.get('/:id', asyncHandler(UserController.getUserById));
router.patch('/:id', asyncHandler(UserController.updateUser));
router.delete('/:id', asyncHandler(UserController.deleteUser));

export default router;
