import createError from 'http-errors';

/**
 * Middleware to validate request payloads against a Zod schema.
 * @param {Object} schema Zod schema object with optional body, query, and params keys
 */
export const validateRequest = (schema) => async (req, res, next) => {
  try {
    if (schema.body) {
      req.body = await schema.body.parseAsync(req.body);
    }
    if (schema.query) {
      req.query = await schema.query.parseAsync(req.query);
    }
    if (schema.params) {
      req.params = await schema.params.parseAsync(req.params);
    }
    next();
  } catch (error) {
    // If it's a ZodError, the errorHandler will handle it and format the fields.
    next(error);
  }
};
