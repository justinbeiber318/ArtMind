import { db } from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';

const safeSelect = {
  id: true, email: true, name: true, avatarUrl: true,
  bio: true, role: true, refreshToken: true, createdAt: true,
};

function presentUser(user) {
  if (!user) return user;
  const { refreshToken, ...rest } = user;
  return { ...rest, status: refreshToken === '__BLOCKED__' ? 'Blocked' : 'Active' };
}

function cleanOptionalString(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const text = String(value).trim();
  return text || null;
}

async function assertCanChangeAdmin(actorId, targetId, change) {
  if (actorId === targetId) {
    if (change.delete) throw ApiError.badRequest('You cannot delete your own admin account');
    if (change.status === 'Blocked') throw ApiError.badRequest('You cannot block your own admin account');
    if (change.role && change.role !== 'ADMIN') throw ApiError.badRequest('You cannot remove your own admin role');
  }

  if (change.delete || (change.role && change.role !== 'ADMIN')) {
    const target = await db.user.findUnique({ where: { id: targetId }, select: { role: true } });
    if (target?.role === 'ADMIN') {
      const admins = await db.user.count({ where: { role: 'ADMIN' } });
      if (admins <= 1) throw ApiError.badRequest('At least one admin account must remain');
    }
  }
}

export const userService = {
  async getProfile(userId) {
    const user = await db.user.findUnique({ where: { id: userId }, select: safeSelect });
    if (!user) throw ApiError.notFound('User not found');
    return presentUser(user);
  },

  async updateProfile(userId, data) {
    const user = await db.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        bio: cleanOptionalString(data.bio),
        avatarUrl: cleanOptionalString(data.avatarUrl),
      },
      select: safeSelect,
    });
    return presentUser(user);
  },

  async updateAvatar(userId, avatarUrl) {
    const user = await db.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: safeSelect,
    });
    return presentUser(user);
  },

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.notFound('User not found');

    const ok = await verifyPassword(currentPassword, user.passwordHash);
    if (!ok) throw ApiError.badRequest('Current password is incorrect');

    const passwordHash = await hashPassword(newPassword);
    await db.user.update({ where: { id: userId }, data: { passwordHash, refreshToken: null } });
  },

  // Aggregates everything the user dashboard needs in one round trip.
  async getDashboard(userId) {
    const [recentlyViewed, favorites, recommendations, collections, activity] =
      await Promise.all([
        db.viewHistory.findMany({
          where: { userId },
          orderBy: { viewedAt: 'desc' },
          take: 8,
          include: { painting: { include: { artist: true } } },
        }),
        db.favorite.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 8,
          include: { painting: { include: { artist: true } } },
        }),
        db.recommendation.findMany({
          where: { userId },
          orderBy: { score: 'desc' },
          take: 8,
          include: { painting: { include: { artist: true } } },
        }),
        db.collection.findMany({
          where: { userId },
          include: { _count: { select: { items: true } } },
        }),
        db.viewHistory.findMany({
          where: { userId },
          orderBy: { viewedAt: 'desc' },
          take: 15,
          select: { id: true, viewedAt: true, painting: { select: { id: true, title: true } } },
        }),
      ]);

    return {
      recentlyViewed: recentlyViewed.map((v) => v.painting),
      favorites: favorites.map((f) => f.painting),
      recommendations: recommendations.map((r) => ({ ...r.painting, reason: r.reason })),
      collections,
      activity,
    };
  },

  // ---- admin user management ----
  async listUsers({ skip, take }) {
    const [items, total] = await Promise.all([
      db.user.findMany({ skip, take, orderBy: { createdAt: 'desc' }, select: safeSelect }),
      db.user.count(),
    ]);
    return { items: items.map(presentUser), total };
  },

  async createUser({ name, email, password, role = 'USER', avatarUrl, bio, status = 'Active' }) {
    if (!password) throw ApiError.badRequest('Password is required');
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) throw ApiError.conflict('Email already registered');
    const passwordHash = await hashPassword(password);
    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        passwordHash,
        role,
        avatarUrl: cleanOptionalString(avatarUrl),
        bio: cleanOptionalString(bio),
        refreshToken: status === 'Blocked' ? '__BLOCKED__' : null,
      },
      select: safeSelect,
    });
    return presentUser(user);
  },

  async updateUser(userId, data, actorId) {
    await assertCanChangeAdmin(actorId, userId, { role: data.role, status: data.status });

    const update = {};
    ['name', 'email', 'avatarUrl', 'bio'].forEach((key) => {
      if (data[key] !== undefined) update[key] = key === 'name' || key === 'email'
        ? String(data[key]).trim()
        : cleanOptionalString(data[key]);
    });
    if (data.role) update.role = data.role;
    if (data.password) update.passwordHash = await hashPassword(data.password);
    if (data.status) update.refreshToken = data.status === 'Blocked' ? '__BLOCKED__' : null;
    const user = await db.user.update({ where: { id: userId }, data: update, select: safeSelect });
    return presentUser(user);
  },

  async setRole(userId, role, actorId) {
    await assertCanChangeAdmin(actorId, userId, { role });
    const user = await db.user.update({ where: { id: userId }, data: { role }, select: safeSelect });
    return presentUser(user);
  },

  async setStatus(userId, status, actorId) {
    await assertCanChangeAdmin(actorId, userId, { status });
    const user = await db.user.update({
      where: { id: userId },
      data: { refreshToken: status === 'Blocked' ? '__BLOCKED__' : null },
      select: safeSelect,
    });
    return presentUser(user);
  },

  async deleteUser(userId, actorId) {
    await assertCanChangeAdmin(actorId, userId, { delete: true });
    await db.user.delete({ where: { id: userId } });
  },
};
