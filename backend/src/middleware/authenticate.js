import createError from 'http-errors';
import { verifyToken } from '../modules/auth/auth.utils.js';
import { User } from '../modules/users/models/User.model.js';

/**
 * Middleware to authenticate requests via JWT.
 * Assumes `resolveTenant` has already run and populated `req.gym`.
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(createError.Unauthorized('Missing or invalid authorization header'));
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return next(createError.Unauthorized('Token is invalid or expired'));
    }

    // 1. Fetch user to ensure they still exist and check tokenVersion
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return next(createError.Unauthorized('User no longer exists'));
    }

    if (user.status !== 'active') {
      return next(createError.Forbidden(`User account is ${user.status}`));
    }

    if (user.tokenVersion !== decoded.tokenVersion) {
      return next(createError.Unauthorized('Token has been revoked (e.g. password was changed)'));
    }

    // 2. CRITICAL MULTI-TENANT CHECK: Ensure the user belongs to the gym they are trying to access
    if (!req.gym) {
      return next(createError.InternalServerError('Tenant resolution must run before authentication'));
    }

    if (user.gymId.toString() !== req.gym._id.toString()) {
      return next(createError.Forbidden('You do not have access to this gym'));
    }

    // 3. Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
