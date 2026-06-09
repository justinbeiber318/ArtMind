import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { uniqueSlug } from '../../utils/slug.js';

const includeRefs = { artist: true, category: true, style: true };

// Translates the gallery filter/sort query into a Prisma query.
function buildWhere(q) {
  const where = {};
  if (q.category) where.category = { slug: q.category };
  if (q.style) where.style = { slug: q.style };
  if (q.artist) where.artist = { slug: q.artist };
  if (q.surface) where.surface = q.surface;
  if (q.search) {
    where.OR = [
      { title: { contains: q.search } },
      { description: { contains: q.search } },
      { artist: { name: { contains: q.search } } },
    ];
  }
  // Color theme filter against the dominant_colors JSON array.
  if (q.color) {
    where.dominantColors = { array_contains: q.color };
  }
  return where;
}

function buildOrderBy(sort) {
  switch (sort) {
    case 'popular': return { viewCount: 'desc' };
    case 'trending': return { trendingScore: 'desc' };
    case 'newest':
    default: return { createdAt: 'desc' };
  }
}

export const paintingService = {
  async list(query, { skip, take }) {
    const where = buildWhere(query);
    const [items, total] = await Promise.all([
      prisma.painting.findMany({
        where, skip, take,
        orderBy: buildOrderBy(query.sort),
        include: includeRefs,
      }),
      prisma.painting.count({ where }),
    ]);
    return { items, total };
  },

  async getBySlug(slug, viewerId) {
    const painting = await prisma.painting.findUnique({
      where: { slug },
      include: includeRefs,
    });
    if (!painting) throw ApiError.notFound('Painting not found');

    // Atomic view increment; record history for signed-in viewers.
    await prisma.painting.update({
      where: { id: painting.id },
      data: { viewCount: { increment: 1 } },
    });
    if (viewerId) {
      await prisma.viewHistory.create({
        data: { userId: viewerId, paintingId: painting.id },
      });
    }
    painting.viewCount += 1;
    return painting;
  },

  // Content-based "similar" lookup: same style/category, ranked by shared
  // dominant colours, excluding the source painting.
  async getSimilar(paintingId, limit = 6) {
    const source = await prisma.painting.findUnique({ where: { id: paintingId } });
    if (!source) throw ApiError.notFound('Painting not found');

    const candidates = await prisma.painting.findMany({
      where: {
        id: { not: paintingId },
        OR: [{ styleId: source.styleId }, { categoryId: source.categoryId }],
      },
      include: includeRefs,
      take: 40,
    });

    const srcColors = new Set(source.dominantColors || []);
    const scored = candidates
      .map((c) => {
        const shared = (c.dominantColors || []).filter((x) => srcColors.has(x)).length;
        const styleMatch = c.styleId === source.styleId ? 2 : 0;
        const catMatch = c.categoryId === source.categoryId ? 1 : 0;
        return { painting: c, score: shared * 1.5 + styleMatch + catMatch };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => s.painting);

    return scored;
  },

  async create(data) {
    const slug = await uniqueSlug(data.title, (s) =>
      prisma.painting.findUnique({ where: { slug: s } }).then(Boolean),
    );
    return prisma.painting.create({
      data: { ...data, slug },
      include: includeRefs,
    });
  },

  async update(id, data) {
    return prisma.painting.update({ where: { id }, data, include: includeRefs });
  },

  async remove(id) {
    await prisma.painting.delete({ where: { id } });
  },

  async saveAiSummary(id, summary) {
    return prisma.painting.update({ where: { id }, data: { aiSummary: summary } });
  },
};
