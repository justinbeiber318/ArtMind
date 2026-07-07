import { db } from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { uniqueSlug } from '../../utils/slug.js';
import { extractDominantColors } from '../recognition/colorExtractor.js';

const includeRefs = { artist: true, category: true, style: true };
const PALETTE_TIMEOUT_MS = 4500;

function cleanOptionalString(value, { lowercase = false } = {}) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const text = String(value).trim();
  if (!text) return null;
  return lowercase ? text.toLowerCase() : text;
}

function colorVariants(hex) {
  const text = String(hex || '').trim();
  if (!text) return [];
  return [...new Set([text, text.toUpperCase(), text.toLowerCase()])];
}

// Translates the gallery filter/sort query into a db query.
function buildWhere(q) {
  const and = [];
  const where = {};

  if (q.category) and.push({ category: { slug: q.category } });
  if (q.style) and.push({ style: { slug: q.style } });
  if (q.artist) and.push({ artist: { slug: q.artist } });

  const surface = cleanOptionalString(q.surface, { lowercase: true });
  if (surface) and.push({ surface });

  if (q.search) {
    and.push({
      OR: [
        { title: { contains: q.search } },
        { description: { contains: q.search } },
        { artist: { name: { contains: q.search } } },
      ],
    });
  }

  // Color theme filter against the dominant_colors JSON array. The seed data and
  // extracted colors may differ in hex casing, so accept both upper/lowercase.
  const colors = colorVariants(q.color);
  if (colors.length) {
    and.push({ OR: colors.map((color) => ({ dominantColors: { array_contains: color } })) });
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
  if (and.length) where.AND = and;
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

function sanitizePaintingData(data) {
  const next = { ...data };

  if ('title' in next && typeof next.title === 'string') next.title = next.title.trim();
  if ('description' in next && typeof next.description === 'string') next.description = next.description.trim();
  if ('imageUrl' in next && typeof next.imageUrl === 'string') next.imageUrl = next.imageUrl.trim();
  if ('thumbnailUrl' in next) next.thumbnailUrl = cleanOptionalString(next.thumbnailUrl);
  if ('medium' in next) next.medium = cleanOptionalString(next.medium);
  if ('surface' in next) next.surface = cleanOptionalString(next.surface, { lowercase: true });

  return next;
}

async function withFavoriteState(painting, viewer) {
  if (!painting) return painting;
  if (!viewer?.id || viewer.role === 'ADMIN') return { ...painting, isFavorited: false };

  const favorite = await db.favorite.findUnique({
    where: { userId_paintingId: { userId: viewer.id, paintingId: painting.id } },
    select: { id: true },
  });

  return { ...painting, isFavorited: Boolean(favorite) };
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

  async getBySlug(slug, viewer, options = {}) {
    const { trackView = true } = options;
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

    let viewCount = enrichedPainting.viewCount;
    if (trackView) {
      await db.painting.update({
        where: { id: enrichedPainting.id },
        data: { viewCount: { increment: 1 } },
      });
      if (viewer?.id) {
        await db.viewHistory.create({
          data: { userId: viewer.id, paintingId: enrichedPainting.id },
        });
      }
      viewCount += 1;
    }

    return withFavoriteState({ ...enrichedPainting, viewCount }, viewer);
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
    const clean = sanitizePaintingData(data);
    const slug = await uniqueSlug(clean.title, (s) =>
      db.painting.findUnique({ where: { slug: s } }).then(Boolean),
    );
    const dominantColors = hasPalette(clean.dominantColors)
      ? data.dominantColors
      : await deriveDominantColorsFromUrl(clean.imageUrl);
    return db.painting.create({
      data: { ...clean, slug, dominantColors },
      include: includeRefs,
    });
  },

  async createUserUpload({
    userId, title, description, artistName,
    categoryId, styleId, medium, surface, year,
    imageUrl, thumbnailUrl, dominantColors,
  }) {
    const cleanArtistName = String(artistName || '').trim();
    let artist = await db.artist.findFirst({ where: { name: cleanArtistName } });
    if (!artist) {
      const artistSlug = await uniqueSlug(cleanArtistName, (s) =>
        db.artist.findUnique({ where: { slug: s } }).then(Boolean),
      );
      artist = await db.artist.create({ data: { name: cleanArtistName, slug: artistSlug } });
    }

    const cleanTitle = String(title || '').trim();
    const slug = await uniqueSlug(cleanTitle, (s) =>
      db.painting.findUnique({ where: { slug: s } }).then(Boolean),
    );

    return db.painting.create({
      data: {
        title: cleanTitle,
        slug,
        description: String(description || '').trim(),
        imageUrl,
        thumbnailUrl: thumbnailUrl || imageUrl,
        medium: cleanOptionalString(medium),
        surface: cleanOptionalString(surface, { lowercase: true }),
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
    const nextData = sanitizePaintingData(data);
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
