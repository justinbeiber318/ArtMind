import { verifyAccessToken } from '../utils/tokens.js';
import { ApiError } from '../utils/ApiError.js';

// Requires a valid access token. Attaches { id, role, email } to req.user.
export function requireAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(ApiError.unauthorized('Missing bearer token'));
  }
  try {
    req.user = verifyAccessToken(token);
    return next();
  } catch {
    return next(ApiError.unauthorized('Invalid or expired token'));
  }
}

// Optional auth: populates req.user if a valid token is present, else continues.
export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme === 'Bearer' && token) {
    try {
      req.user = verifyAccessToken(token);
    } catch {
      /* ignore — treat as anonymous */
    }
  }
  return next();
}

export function requireAdmin(req, _res, next) {
  if (req.user?.role !== 'ADMIN') {
    return next(ApiError.forbidden('Admin access required'));
  }
  return next();
}
