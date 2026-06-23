import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export function notFoundHandler(req, _res, next) {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let details = err.details;

  // Map common Prisma errors to friendly HTTP responses.
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 409;
      message = `A record with that ${err.meta?.target ?? 'value'} already exists`;
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Record not found';
    } else if (err.code === 'P2003') {
      statusCode = 400;
      message = 'This record is still referenced by others and cannot be deleted';
    }
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
