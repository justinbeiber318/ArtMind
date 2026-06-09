// Wraps async route handlers so thrown/rejected errors reach Express'
// error middleware without try/catch noise in every controller.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
