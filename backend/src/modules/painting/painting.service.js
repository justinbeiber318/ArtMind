import { db } from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { uniqueSlug } from '../../utils/slug.js';
import { extractDominantColors } from '../recognition/colorExtractor.js';

const includeRefs = { artist: true, category: true, style: true };
const PALETTE_TIMEOUT_MS = 4500;

// Translates the gallery filter/sort query into a db query.
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
  if (q.status === 'pending') {
    where.uploadedById = { not: null };
    where.featured = false;
  }
  if (q.status === 'approved') {
    where.featured = true;
  }
  if (q.status === 'system') {
    where.uploadedById = null;
  }
  return where;
}

function publicVisibilityWhere() {
  return {
    OR: [
      { uploadedById: null },
      { featured: true },
    ],
  };
}

function buildPublicWhere(query) {
  return {
    AND: [
      buildWhere(query),
      publicVisibilityWhere(),
    ],
  };
}

function buildOrderBy(sort) {
  switch (sort) {
    case 'popular': return { viewCount: 'desc' };
    case 'trending': return { trendingScore: 'desc' };
    case 'newest':
    default: return { createdAt: 'desc' };
  }
}

function hasPalette(colors) {
  return Array.isArray(colors) && colors.length > 0;
}

async function fetchImageBuffer(url) {
  if (!url || !/^https?:\/\//i.test(url)) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PALETTE_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return null;
    const type = response.headers.get('content-type') || '';
    if (type && !type.startsWith('image/')) return null;
    return Buffer.from(await response.arrayBuffer());
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function deriveDominantColorsFromUrl(imageUrl) {
  const buffer = await fetchImageBuffer(imageUrl);
  if (!buffer) return [];
  try {
    return await extractDominantColors(buffer, 5);
  } catch {
    return [];
  }
}

async function ensureDominantColors(painting) {
  if (!painting || hasPalette(painting.dominantColors)) return painting;
  const dominantColors = await deriveDominantColorsFromUrl(painting.imageUrl);
  if (!hasPalette(dominantColors)) return painting;
  await db.painting.update({
    where: { id: painting.id },
    data: { dominantColors },
  });
  return { ...painting, dominantColors };
}

export const paintingService = {
  async list(query, { skip, take }) {
    const where = buildPublicWhere(query);
    const [items, total] = await Promise.all([
      db.painting.findMany({
        where, skip, take,
        orderBy: buildOrderBy(query.sort),
        include: includeRefs,
      }),
      db.painting.count({ where }),
    ]);
    return { items, total };
  },

  async listAdmin(query, { skip, take }) {
    const where = buildWhere(query);
    const [items, total] = await Promise.all([
      db.painting.findMany({
        where, skip, take,
        orderBy: buildOrderBy(query.sort),
        include: includeRefs,
      }),
      db.painting.count({ where }),
    ]);
    return { items, total };
  },

  async getBySlug(slug, viewer) {
    const painting = await db.painting.findUnique({
      where: { slug },
      include: includeRefs,
    });
    if (!painting) throw ApiError.notFound('Painting not found');

    const isPendingUserUpload = painting.uploadedById && !painting.featured;
    const canViewPending = viewer?.role === 'ADMIN' || viewer?.id === painting.uploadedById;
    if (isPendingUserUpload && !canViewPending) {
      throw ApiError.notFound('Painting not found');
    }

    const enrichedPainting = await ensureDominantColors(painting);

    // Atomic view increment; record history for signed-in viewers.
    await db.painting.update({
      where: { id: enrichedPainting.id },
      data: { viewCount: { increment: 1 } },
    });
    if (viewer?.id) {
      await db.viewHistory.create({
        data: { userId: viewer.id, paintingId: enrichedPainting.id },
      });
    }
    enrichedPainting.viewCount += 1;
    return enrichedPainting;
  },

  // Content-based "similar" lookup: same style/category, ranked by shared
  // dominant colours, excluding the source painting.
  async getSimilar(paintingId, limit = 6) {
    const source = await db.painting.findUnique({ where: { id: paintingId } });
    if (!source) throw ApiError.notFound('Painting not found');

    const candidates = await db.painting.findMany({
      where: {
        AND: [
          { id: { not: paintingId } },
          { OR: [{ styleId: source.styleId }, { categoryId: source.categoryId }] },
          publicVisibilityWhere(),
        ],
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
      db.painting.findUnique({ where: { slug: s } }).then(Boolean),
    );
    const dominantColors = hasPalette(data.dominantColors)
      ? data.dominantColors
      : await deriveDominantColorsFromUrl(data.imageUrl);
    return db.painting.create({
      data: { ...data, slug, dominantColors },
      include: includeRefs,
    });
  },

  async createUserUpload({
    userId, title, description, artistName,
    categoryId, styleId, medium, surface, year,
    imageUrl, thumbnailUrl, dominantColors,
  }) {
    let artist = await db.artist.findFirst({ where: { name: artistName } });
    if (!artist) {
      const artistSlug = await uniqueSlug(artistName, (s) =>
        db.artist.findUnique({ where: { slug: s } }).then(Boolean),
      );
      artist = await db.artist.create({ data: { name: artistName, slug: artistSlug } });
    }

    const slug = await uniqueSlug(title, (s) =>
      db.painting.findUnique({ where: { slug: s } }).then(Boolean),
    );

    return db.painting.create({
      data: {
        title,
        slug,
        description,
        imageUrl,
        thumbnailUrl: thumbnailUrl || imageUrl,
        medium: medium || null,
        surface: surface || null,
        year: year ? Number(year) : null,
        dominantColors: dominantColors || [],
        artistId: artist.id,
        categoryId: Number(categoryId),
        styleId: styleId ? Number(styleId) : null,
        uploadedById: userId,
      },
      include: includeRefs,
    });
  },

  async listByUploader(userId) {
    return db.painting.findMany({
      where: { uploadedById: userId },
      orderBy: { createdAt: 'desc' },
      include: includeRefs,
    });
  },

  async update(id, data) {
    const nextData = { ...data };
    if (!hasPalette(nextData.dominantColors) && nextData.imageUrl) {
      const dominantColors = await deriveDominantColorsFromUrl(nextData.imageUrl);
      if (hasPalette(dominantColors)) nextData.dominantColors = dominantColors;
    }
    return db.painting.update({ where: { id }, data: nextData, include: includeRefs });
  },

  async remove(id) {
    await db.painting.delete({ where: { id } });
  },

  async saveAiSummary(id, summary) {
    return db.painting.update({ where: { id }, data: { aiSummary: summary } });
  },
};
