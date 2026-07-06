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

export const userService = {
  async getProfile(userId) {
    const user = await db.user.findUnique({ where: { id: userId }, select: safeSelect });
    if (!user) throw ApiError.notFound('User not found');
    return presentUser(user);
  },

  async updateProfile(userId, data) {
    const user = await db.user.update({
      where: { id: userId },
      data: { name: data.name, bio: data.bio, avatarUrl: data.avatarUrl },
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
    await db.user.update({ where: { id: userId }, data: { passwordHash } });
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
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) throw ApiError.conflict('Email already registered');
    const passwordHash = await hashPassword(password || 'Password123!');
    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        avatarUrl,
        bio,
        refreshToken: status === 'Blocked' ? '__BLOCKED__' : null,
      },
      select: safeSelect,
    });
    return presentUser(user);
  },

  async updateUser(userId, data) {
    const update = {};
    ['name', 'email', 'avatarUrl', 'bio'].forEach((key) => {
      if (data[key] !== undefined) update[key] = data[key];
    });
    if (data.role) update.role = data.role;
    if (data.password) update.passwordHash = await hashPassword(data.password);
    if (data.status) update.refreshToken = data.status === 'Blocked' ? '__BLOCKED__' : null;
    const user = await db.user.update({ where: { id: userId }, data: update, select: safeSelect });
    return presentUser(user);
  },

  async setRole(userId, role) {
    const user = await db.user.update({ where: { id: userId }, data: { role }, select: safeSelect });
    return presentUser(user);
  },

  async setStatus(userId, status) {
    const user = await db.user.update({
      where: { id: userId },
      data: { refreshToken: status === 'Blocked' ? '__BLOCKED__' : null },
      select: safeSelect,
    });
    return presentUser(user);
  },

  async deleteUser(userId) {
    await db.user.delete({ where: { id: userId } });
  },
};
