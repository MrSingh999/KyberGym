import createError from 'http-errors';

/**
 * Middleware to protect routes based on User Role (RBAC).
 * Must be used AFTER `requireAuth` (Phase 3) which sets `req.user`.
 * 
 * @param {...string} allowedRoles Array of allowed roles
 */
export const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure requireAuth has already run
    if (!req.user) {
      return next(createError.Unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(createError.Forbidden('Insufficient permissions to access this resource'));
    }

    next();
  };
};
