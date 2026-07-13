import { logger } from '../config/logger.js';
import { env } from '../config/env.js';
import createError from 'http-errors';

export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Ensure it's an http-error, otherwise wrap it
  if (!createError.isHttpError(error)) {
    // Check for Mongoose/Mongo specific errors
    if (error.name === 'CastError') {
      error = createError.BadRequest(`Invalid ID format: ${error.value}`);
    } else if (error.code === 11000) {
      error = createError.Conflict('Duplicate field value entered');
    } else {
      // Default to 500 for unhandled native errors
      error = createError.InternalServerError(error.message);
    }
  }

  const statusCode = error.status || 500;
  const message = error.message || 'Internal Server Error';

  // Log error (stack trace only in development, or if it's a 500 server error)
  if (env.NODE_ENV === 'development' || statusCode === 500) {
    logger.error(err.stack || err.message || err);
  }

  const stack = env.NODE_ENV === 'development' ? err.stack : null;
  
  // Specific formatting for Zod validation errors
  let errorsList = null;
  if (err.name === 'ZodError') {
    error = createError.BadRequest('Validation Failed');
    errorsList = err.errors.map(e => ({ field: e.path.join('.'), message: e.message }));
  }

  return res.status(statusCode).json({
    success: false,
    message: error.message,
    ...(errorsList && { errors: errorsList }),
    ...(stack && { stack }),
  });
};
