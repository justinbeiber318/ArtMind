import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export function notFoundHandler(req, _res, next) {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
}

export function errorHandler(err, _req, res, _next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let details = err.details;

  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'Image is too large. Maximum size is 5 MB';
  }

  if (statusCode >= 500 && env.nodeEnv !== 'test') {
    // Real logging would go to a transport (pino/winston); console keeps deps light.
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    error: { message, ...(details ? { details } : {}) },
  });
}
