import { prisma } from '../../config/prisma.js';

// Helper for date bucketing (last N days).
function lastNDays(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

export const analyticsService = {
  async overview() {
    const [users, paintings, artists, totalViews, searches, recognitions] =
      await Promise.all([
        prisma.user.count(),
        prisma.painting.count(),
        prisma.artist.count(),
        prisma.painting.aggregate({ _sum: { viewCount: true } }),
        prisma.analytics.count({ where: { metric: 'search' } }),
        prisma.analytics.count({ where: { metric: 'recognition' } }),
      ]);
    return {
      users,
      paintings,
      artists,
      totalViews: totalViews._sum.viewCount || 0,
      searches,
      recognitions,
    };
  },

  async mostViewedPaintings(limit = 10) {
    return prisma.painting.findMany({
      orderBy: { viewCount: 'desc' },
      take: limit,
      select: { id: true, title: true, viewCount: true, artist: { select: { name: true } } },
    });
  },

  async popularCategories() {
    const rows = await prisma.painting.groupBy({
      by: ['categoryId'],
      _sum: { viewCount: true },
      _count: { _all: true },
    });
    const cats = await prisma.category.findMany();
    const byId = new Map(cats.map((c) => [c.id, c.name]));
    return rows
      .map((r) => ({
        category: byId.get(r.categoryId) || 'Unknown',
        views: r._sum.viewCount || 0,
        count: r._count._all,
      }))
      .sort((a, b) => b.views - a.views);
  },

  async trendingStyles() {
    const rows = await prisma.painting.groupBy({
      by: ['styleId'],
      _avg: { trendingScore: true },
      _count: { _all: true },
    });
    const styles = await prisma.style.findMany();
    const byId = new Map(styles.map((s) => [s.id, s.name]));
    return rows
      .filter((r) => r.styleId != null)
      .map((r) => ({
        style: byId.get(r.styleId) || 'Unknown',
        avgTrending: Number((r._avg.trendingScore || 0).toFixed(2)),
        count: r._count._all,
      }))
      .sort((a, b) => b.avgTrending - a.avgTrending);
  },

  // Daily new-user counts for the last 30 days, zero-filled.
  async userGrowth(days = 30) {
    const since = lastNDays(days);
    const users = await prisma.user.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    });
    const buckets = new Map();
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      buckets.set(d.toISOString().slice(0, 10), 0);
    }
    for (const u of users) {
      const key = u.createdAt.toISOString().slice(0, 10);
      if (buckets.has(key)) buckets.set(key, buckets.get(key) + 1);
    }
    return [...buckets.entries()]
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },

  async aiLogs(limit = 50) {
    return prisma.chatLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true, prompt: true, response: true, tokensUsed: true,
        createdAt: true, user: { select: { email: true } },
      },
    });
  },
};
