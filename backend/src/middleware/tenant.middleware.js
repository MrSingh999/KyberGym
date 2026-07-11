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
    const host = req.get('host'); // e.g. ironfit.app.com

    let gym = null;

    if (tenantIdHeader) {
      // 1. Resolve by explicit header (useful for API testing / cross-tenant portals)
      gym = await Gym.findById(tenantIdHeader);
    } else if (host) {
      // 2. Resolve by domain/subdomain
      // Note: This logic depends heavily on your production deployment URL structure.
      // We will check customDomain first, then fallback to subdomain.
      
      const hostname = host.split(':')[0]; // Remove port if present
      
      gym = await Gym.findOne({ 
        $or: [
          { customDomain: hostname },
          { subdomain: hostname.split('.')[0] } // Extract subdomain (e.g. 'ironfit' from 'ironfit.app.com')
        ]
      });
    }

    if (!gym) {
      return next(createError.NotFound('Tenant could not be resolved from request context'));
    }

    if (gym.isDeleted) {
      return next(createError.NotFound('Tenant not found'));
    }

    if (gym.subscription?.status === 'canceled') {
      return next(createError.Forbidden('Tenant account is suspended or canceled'));
    }

    // Attach to request lifecycle for use in controllers and other middlewares
    req.gym = gym;
    next();
  } catch (error) {
    next(error);
  }
};
