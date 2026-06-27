import { prisma } from '../../config/prisma.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/tokens.js';
import { ApiError } from '../../utils/ApiError.js';

function publicUser(user) {
  const { passwordHash, refreshToken, ...rest } = user;
  return rest;
}

function issueTokens(user) {
  const payload = { id: user.id, role: user.role, email: user.email };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken({ id: user.id }),
  };
}

export const authService = {
  async register({ email, password, name }) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw ApiError.conflict('Email already registered');

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, passwordHash, name },
    });

    const tokens = issueTokens(user);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });
    return { user: publicUser(user), ...tokens };
  },

  async login({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw ApiError.unauthorized('Invalid credentials');
    if (user.refreshToken === '__BLOCKED__') throw ApiError.forbidden('Account is blocked');

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) throw ApiError.unauthorized('Invalid credentials');

    const tokens = issueTokens(user);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });
    return { user: publicUser(user), ...tokens };
  },

  async refresh(refreshToken) {
    if (!refreshToken) throw ApiError.unauthorized('No refresh token');
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid refresh token');
    }
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    // Reject if the stored token doesn't match — handles logout / rotation / theft.
    if (user?.refreshToken === '__BLOCKED__') throw ApiError.forbidden('Account is blocked');
    if (!user || user.refreshToken !== refreshToken) {
      throw ApiError.unauthorized('Refresh token revoked');
    }
    const tokens = issueTokens(user);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });
    return tokens;
  },

  async logout(userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  },
};
