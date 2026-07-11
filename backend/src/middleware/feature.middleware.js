import createError from 'http-errors';

/**
 * Middleware to protect routes based on Gym Feature Flags.
 * Must be used AFTER `resolveTenant` which sets `req.gym`.
 * 
 * @param {string} featureName The name of the feature from Gym.features
 */
export const requireFeature = (featureName) => {
  return (req, res, next) => {
    // Ensure resolveTenant has already run
    if (!req.gym) {
      return next(createError.InternalServerError('Tenant resolution required before feature check'));
    }

    const hasFeature = req.gym.features && req.gym.features[featureName];
    
    if (!hasFeature) {
      return next(createError.Forbidden(`Feature '${featureName}' is not enabled for this gym`));
    }

    next();
  };
};
