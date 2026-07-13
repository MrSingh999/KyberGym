import createError from 'http-errors';
import { Gym } from '../modules/gyms/models/Gym.model.js';

/**
 * Middleware to resolve the current Tenant (Gym) from the request.
 * Resolves via 'x-tenant-id' header or subdomain parsing.
 * Attaches the found Gym to `req.gym`.
 */
export const resolveTenant = async (req, res, next) => {
  try {
    const tenantIdHeader = req.get('x-tenant-id');
    const host = req.get('host');

    let gym = null;

    if (tenantIdHeader) {
      // 1. Resolve by explicit header (useful for API testing / cross-tenant portals)
      gym = await Gym.findById(tenantIdHeader);
    } else if (host) {
      // 2. Resolve by domain/subdomain
      const hostname = host.split(':')[0]; // Remove port if present

      gym = await Gym.findOne({ subdomain: hostname.split('.')[0] });
    }

    if (!gym) {
      return next(createError.NotFound('Tenant could not be resolved from request context'));
    }

    if (gym.isDeleted) {
      return next(createError.NotFound('Tenant not found'));
    }

    if (!gym.isActive) {
      return next(createError.Forbidden('This gym account is currently inactive'));
    }

    // Attach to request lifecycle for use in controllers and other middlewares
    req.gym = gym;
    next();
  } catch (error) {
    next(error);
  }
};
