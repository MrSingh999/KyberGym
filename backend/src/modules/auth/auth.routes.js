import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validateRequest } from '../../validators/validateRequest.js';
import { 
  registerOwnerSchema, 
  loginSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema, 
  verifyEmailSchema,
  changePasswordSchema 
} from './auth.validators.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { resolveTenant } from '../../middleware/tenant.middleware.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();

// Owner Registration doesn't need tenantMiddleware because it CREATES the tenant
router.post(
  '/register-owner',
  validateRequest(registerOwnerSchema),
  asyncHandler(AuthController.registerOwner)
);

// The rest of the routes require the Tenant to be resolved
router.use(asyncHandler(resolveTenant));

router.post(
  '/login',
  validateRequest(loginSchema),
  asyncHandler(AuthController.login)
);

router.post('/logout', asyncHandler(AuthController.logout));
router.post('/refresh-token', asyncHandler(AuthController.refreshToken));

router.post(
  '/forgot-password',
  validateRequest(forgotPasswordSchema),
  asyncHandler(AuthController.forgotPassword)
);

router.post(
  '/reset-password',
  validateRequest(resetPasswordSchema),
  asyncHandler(AuthController.resetPassword)
);

router.post(
  '/verify-email',
  validateRequest(verifyEmailSchema),
  asyncHandler(AuthController.verifyEmail)
);

// Protected routes
router.use(authenticate);

router.get('/me', asyncHandler(AuthController.getMe));
router.post(
  '/change-password',
  validateRequest(changePasswordSchema),
  asyncHandler(AuthController.changePassword)
);

export default router;
