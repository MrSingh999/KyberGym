import createError from 'http-errors';
import { GymSubscription } from '../modules/subscription/models/GymSubscription.model.js';

/**
 * Middleware to enforce SaaS subscription access rules.
 * MUST run after `resolveTenant` (which populates `req.gym`).
 */
export const requireActiveSubscription = async (req, res, next) => {
  try {
    if (!req.gym) {
      return next(createError.InternalServerError('Tenant missing. resolveTenant must run first.'));
    }

    const subscription = await GymSubscription.findOne({ gymId: req.gym._id });
    
    if (!subscription) {
      return next(createError.Forbidden('No subscription found for this gym.'));
    }

    // 1. Blocked States
    if (subscription.status === 'suspended' || subscription.status === 'cancelled') {
      return next(createError.Forbidden('Your account has been suspended or cancelled.'));
    }

    // 2. Read-Only State (Expired)
    if (subscription.status === 'expired') {
      // If the route is attempting to mutate data (POST/PUT/PATCH/DELETE), block it.
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        return next(createError.PaymentRequired('Subscription expired. Your dashboard is in read-only mode until you renew.'));
      }
    }

    // 3. Trial or Active State - Allowed
    next();
  } catch (error) {
    next(error);
  }
};
