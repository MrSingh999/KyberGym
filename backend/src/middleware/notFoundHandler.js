import createError from 'http-errors';

export const notFoundHandler = (req, res, next) => {
  next(createError.NotFound(`Not Found - ${req.originalUrl}`));
};
