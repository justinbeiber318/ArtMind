import { db } from '../../config/database.js';

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
        db.user.count(),
        db.painting.count(),
        db.artist.count(),
        db.painting.aggregate({ _sum: { viewCount: true } }),
        db.analytics.count({ where: { metric: 'search' } }),
        db.analytics.count({ where: { metric: 'recognition' } }),
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
    return db.painting.findMany({
      orderBy: { viewCount: 'desc' },
      take: limit,
      select: { id: true, title: true, viewCount: true, artist: { select: { name: true } } },
    });
  },

  async popularCategories() {
    const rows = await db.painting.groupBy({
      by: ['categoryId'],
      _sum: { viewCount: true },
      _count: { _all: true },
    });
    const cats = await db.category.findMany();
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
    const rows = await db.painting.groupBy({
      by: ['styleId'],
      _avg: { trendingScore: true },
      _count: { _all: true },
    });
    const styles = await db.style.findMany();
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
    const users = await db.user.findMany({
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
    return db.chatLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true, prompt: true, response: true, tokensUsed: true,
        createdAt: true, user: { select: { email: true } },
      },
    });
  },

  async exportPaintingsCsv() {
    const paintings = await db.painting.findMany({
      include: { artist: true, category: true, style: true },
      orderBy: { createdAt: 'desc' },
    });
    let csv = 'ID,Title,Artist,Category,Style,Surface,Medium,Price,Views,Trending Score,Featured,Created At\n';
    for (const p of paintings) {
      const title = `"${(p.title || '').replace(/"/g, '""')}"`;
      const artist = `"${(p.artist?.name || '').replace(/"/g, '""')}"`;
      const category = `"${(p.category?.name || '').replace(/"/g, '""')}"`;
      const style = `"${(p.style?.name || '').replace(/"/g, '""')}"`;
      const surface = `"${(p.surface || '').replace(/"/g, '""')}"`;
      const medium = `"${(p.medium || '').replace(/"/g, '""')}"`;
      const price = p.price ? p.price.toString() : '';
      csv += `${p.id},${title},${artist},${category},${style},${surface},${medium},${price},${p.viewCount},${p.trendingScore},${p.featured},${p.createdAt.toISOString()}\n`;
    }
    return csv;
  },

  async recalculateTrending() {
    const paintings = await db.painting.findMany({
      select: { id: true, viewCount: true, _count: { select: { favorites: true } } }
    });
    const updates = paintings.map((p) => {
      const score = p.viewCount / 100 + p._count.favorites * 2.0;
      return db.painting.update({
        where: { id: p.id },
        data: { trendingScore: score }
      });
    });
    await db.$transaction(updates);
    return { updated: updates.length };
  },

  async rebuildAllRecommendations() {
    const users = await db.user.findMany({ select: { id: true } });
    const { recommendationService } = await import('../recommendation/recommendation.service.js');
    let count = 0;
    for (const u of users) {
      await recommendationService.rebuildForUser(u.id);
      count++;
    }
    return { usersRebuilt: count };
  },

  async cleanChatLogs() {
    const total = await db.chatLog.count();
    if (total > 100) {
      const oldestToKeep = await db.chatLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip: 99,
        take: 1,
        select: { createdAt: true }
      });
      if (oldestToKeep.length > 0) {
        const result = await db.chatLog.deleteMany({
          where: { createdAt: { lt: oldestToKeep[0].createdAt } }
        });
        return { deleted: result.count };
      }
    }
    return { deleted: 0 };
  },

  async systemHealth() {
    const fs = await import('fs/promises');
    const path = await import('path');
    const { UPLOAD_DIR } = await import('../../utils/storage.js');
    let uploadCount = 0;
    let uploadSize = 0;
    try {
      const files = await fs.readdir(UPLOAD_DIR);
      uploadCount = files.length;
      for (const file of files) {
        const stats = await fs.stat(path.join(UPLOAD_DIR, file));
        uploadSize += stats.size;
      }
    } catch { /* ignore */ }
    
    const dbStatus = await db.$queryRaw`SELECT 1 as ok`.then(() => 'Connected').catch(() => 'Disconnected');

    return {
      dbStatus,
      uptime: process.uptime(),
      uploadCount,
      uploadSizeMb: Number((uploadSize / (1024 * 1024)).toFixed(2))
    };
  },
};
