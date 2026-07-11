/**
 * Wraps async route handlers to pass errors to the global error handler
 * without needing try/catch blocks in every controller.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};
