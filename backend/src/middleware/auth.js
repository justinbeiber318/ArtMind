import { verifyAccessToken } from '../utils/tokens.js';
import { ApiError } from '../utils/ApiError.js';
import { prisma } from '../config/prisma.js';

async function activeUserFromToken(token) {
  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid or expired token');
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, role: true, email: true, refreshToken: true },
  });

  if (!user) throw ApiError.unauthorized('User no longer exists');
  if (user.refreshToken === '__BLOCKED__') throw ApiError.forbidden('Account is blocked');

  return { id: user.id, role: user.role, email: user.email };
}

// Requires a valid access token. Attaches { id, role, email } to req.user.
export async function requireAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(ApiError.unauthorized('Missing bearer token'));
  }

  try {
    req.user = await activeUserFromToken(token);
    return next();
  } catch (err) {
    return next(err);
  }
}

// Optional auth: populates req.user if a valid, active token is present, else continues.
export async function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme === 'Bearer' && token) {
    try {
      req.user = await activeUserFromToken(token);
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

export function requireUser(req, _res, next) {
  if (req.user?.role === 'ADMIN') {
    return next(ApiError.forbidden('User feature is not available for admin accounts'));
  }
  return next();
}
