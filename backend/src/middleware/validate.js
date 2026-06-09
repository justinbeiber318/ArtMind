import { ApiError } from '../utils/ApiError.js';

// Validates req against a Zod schema shaped like { body, query, params }.
export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });
  if (!result.success) {
    const details = result.error.issues.map((i) => ({
      path: i.path.join('.'),
      message: i.message,
    }));
    return next(ApiError.badRequest('Validation failed', details));
  }
  // Replace with parsed/coerced values.
  Object.assign(req, result.data);
  return next();
};
