import createError from 'http-errors';
import jwt from 'jsonwebtoken';
import { authConfig } from '../../config/env.js';
import { SuperAdmin } from './superAdmin.model.js';

export const authenticateSuperAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(createError.Unauthorized('Missing or invalid authorization header'));
    }

    const token = authHeader.split(' ')[1];
    let decoded;

    try {
      decoded = jwt.verify(token, authConfig.superAdminJwtSecret);
    } catch (err) {
      return next(createError.Unauthorized('Token is invalid or expired'));
    }

    const superAdmin = await SuperAdmin.findById(decoded.id);
    if (!superAdmin) {
      return next(createError.Unauthorized('Super Admin no longer exists'));
    }

    if (!superAdmin.isActive) {
      return next(createError.Forbidden('Super Admin account is inactive'));
    }

    req.superAdmin = superAdmin;
    next();
  } catch (error) {
    next(error);
  }
};
