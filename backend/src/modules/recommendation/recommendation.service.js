import { db } from '../../config/database.js';

const publicPaintingWhere = {
  OR: [
    { uploadedById: null },
    { featured: true },
  ],
};

/**
 * RecommendationService
 * Hybrid recommender combining three signals:
 *   1. Content affinity  — categories/styles/colours the user engages with
 *   2. Collaborative      — paintings favourited by users with overlapping taste
 *   3. Popularity prior   — trending score as a tie-breaker / cold-start fallback
 *
 * Scores are normalised and persisted to the `recommendations` table so the
 * dashboard and painting pages can read them cheaply.
 */
export const recommendationService = {
  async buildUserProfile(userId) {
    const [favorites, history] = await Promise.all([
      db.favorite.findMany({ where: { userId }, include: { painting: true } }),
      db.viewHistory.findMany({
        where: { userId }, take: 100, orderBy: { viewedAt: 'desc' },
        include: { painting: true },
      }),
    ]);

    const categoryWeight = new Map();
    const styleWeight = new Map();
    const colorWeight = new Map();
    const seen = new Set();

    const accumulate = (painting, weight) => {
      seen.add(painting.id);
      if (painting.categoryId) {
        categoryWeight.set(painting.categoryId, (categoryWeight.get(painting.categoryId) || 0) + weight);
      }
      if (painting.styleId) {
        styleWeight.set(painting.styleId, (styleWeight.get(painting.styleId) || 0) + weight);
      }
      for (const c of painting.dominantColors || []) {
        colorWeight.set(c, (colorWeight.get(c) || 0) + weight * 0.5);
      }
    };

    favorites.forEach((f) => accumulate(f.painting, 3)); // explicit signal
    history.forEach((h) => accumulate(h.painting, 1));    // implicit signal

    return { categoryWeight, styleWeight, colorWeight, seen };
  },

  // Users who share favourites with this user → their other favourites are candidates.
  async collaborativeCandidates(userId, seen) {
    const myFavs = await db.favorite.findMany({
      where: { userId }, select: { paintingId: true },
    });
    const myIds = myFavs.map((f) => f.paintingId);
    if (myIds.length === 0) return new Map();

    const neighbours = await db.favorite.findMany({
      where: { paintingId: { in: myIds }, userId: { not: userId } },
      select: { userId: true },
    });
    const neighbourIds = [...new Set(neighbours.map((n) => n.userId))];
    if (neighbourIds.length === 0) return new Map();

    const theirFavs = await db.favorite.findMany({
      where: { userId: { in: neighbourIds } },
      select: { paintingId: true },
    });

    const counts = new Map();
    for (const f of theirFavs) {
      if (seen.has(f.paintingId)) continue;
      counts.set(f.paintingId, (counts.get(f.paintingId) || 0) + 1);
    }
    return counts; // paintingId -> co-occurrence count
  },

  async rebuildForUser(userId) {
    const profile = await this.buildUserProfile(userId);
    const collab = await this.collaborativeCandidates(userId, profile.seen);

    // Candidate pool: everything the user hasn't already engaged with.
    const candidates = await db.painting.findMany({
      where: {
        AND: [
          { id: { notIn: [...profile.seen] } },
          publicPaintingWhere,
        ],
      },
      take: 400,
    });

    const maxTrending = Math.max(1, ...candidates.map((c) => c.trendingScore));

    const scored = candidates.map((p) => {
      const content =
        (profile.categoryWeight.get(p.categoryId) || 0) * 1.0 +
        (profile.styleWeight.get(p.styleId) || 0) * 1.2 +
        (p.dominantColors || []).reduce((s, c) => s + (profile.colorWeight.get(c) || 0), 0);

      const collaborative = (collab.get(p.id) || 0) * 2.0;
      const popularity = (p.trendingScore / maxTrending) * 0.8;

      const score = content + collaborative + popularity;
      const reason =
        collaborative > 0 ? 'Collectors with similar taste enjoyed this'
        : content > 0 ? 'Based on styles and colours you favour'
        : 'Trending in the gallery';

      return { paintingId: p.id, score, reason };
    });

    const top = scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 24);

    // Replace the user's recommendation set transactionally.
    await db.$transaction(async (tx) => {
      await tx.recommendation.deleteMany({ where: { userId } });
      for (const t of top) {
        await tx.recommendation.create({
          data: { userId, paintingId: t.paintingId, score: t.score, reason: t.reason },
        });
      }
    });

    return top.length;
  },

  async getForUser(userId, limit = 12) {
    let recs = await db.recommendation.findMany({
      where: { userId, painting: publicPaintingWhere },
      orderBy: { score: 'desc' },
      take: limit,
      include: { painting: { include: { artist: true, style: true } } },
    });

    // Cold start: no recs yet → seed from trending and persist.
    if (recs.length === 0) {
      await this.rebuildForUser(userId);
      recs = await db.recommendation.findMany({
        where: { userId, painting: publicPaintingWhere }, orderBy: { score: 'desc' }, take: limit,
        include: { painting: { include: { artist: true, style: true } } },
      });
    }
    return recs.map((r) => ({ ...r.painting, recommendationReason: r.reason }));
  },

  // Anonymous / preview recommendations for the home page.
  async getTrendingPreview(limit = 6) {
    return db.painting.findMany({
      where: publicPaintingWhere,
      orderBy: { trendingScore: 'desc' }, take: limit,
      include: { artist: true, style: true },
    });
  },
};
