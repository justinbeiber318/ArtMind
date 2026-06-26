import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';

const safeSelect = {
  id: true, email: true, name: true, avatarUrl: true,
  bio: true, role: true, createdAt: true,
};

export const userService = {
  async getProfile(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: safeSelect });
    if (!user) throw ApiError.notFound('User not found');
    return user;
  },

  async updateProfile(userId, data) {
    return prisma.user.update({
      where: { id: userId },
      data: { name: data.name, bio: data.bio, avatarUrl: data.avatarUrl },
      select: safeSelect,
    });
  },

  async updateAvatar(userId, avatarUrl) {
    return prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: safeSelect,
    });
  },

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.notFound('User not found');

    const ok = await verifyPassword(currentPassword, user.passwordHash);
    if (!ok) throw ApiError.badRequest('Current password is incorrect');

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  },

  // Aggregates everything the user dashboard needs in one round trip.
  async getDashboard(userId) {
    const [recentlyViewed, favorites, recommendations, collections, activity] =
      await Promise.all([
        prisma.viewHistory.findMany({
          where: { userId },
          orderBy: { viewedAt: 'desc' },
          take: 8,
          include: { painting: { include: { artist: true } } },
        }),
        prisma.favorite.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 8,
          include: { painting: { include: { artist: true } } },
        }),
        prisma.recommendation.findMany({
          where: { userId },
          orderBy: { score: 'desc' },
          take: 8,
          include: { painting: { include: { artist: true } } },
        }),
        prisma.collection.findMany({
          where: { userId },
          include: { _count: { select: { items: true } } },
        }),
        prisma.viewHistory.findMany({
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
      prisma.user.findMany({ skip, take, orderBy: { createdAt: 'desc' }, select: safeSelect }),
      prisma.user.count(),
    ]);
    return { items, total };
  },

  async setRole(userId, role) {
    return prisma.user.update({ where: { id: userId }, data: { role }, select: safeSelect });
  },

  async deleteUser(userId) {
    await prisma.user.delete({ where: { id: userId } });
  },
};
