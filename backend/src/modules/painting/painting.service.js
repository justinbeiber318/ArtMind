import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { uniqueSlug } from '../../utils/slug.js';

const includeRefs = { artist: true, category: true, style: true };

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

// Translates the gallery filter/sort query into a Prisma query.
function buildWhere(q) {
  const and = [];

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

  return and.length ? { AND: and } : {};
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

  const favorite = await prisma.favorite.findUnique({
    where: { userId_paintingId: { userId: viewer.id, paintingId: painting.id } },
    select: { id: true },
  });

  return { ...painting, isFavorited: Boolean(favorite) };
}

export const paintingService = {
  async list(query, { skip, take }) {
    const where = buildPublicWhere(query);
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

  async listAdmin(query, { skip, take }) {
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

  async getBySlug(slug, viewer, options = {}) {
    const { trackView = true } = options;
    const painting = await prisma.painting.findUnique({
      where: { slug },
      include: includeRefs,
    });
    if (!painting) throw ApiError.notFound('Painting not found');

    const isPendingUserUpload = painting.uploadedById && !painting.featured;
    const canViewPending = viewer?.role === 'ADMIN' || viewer?.id === painting.uploadedById;
    if (isPendingUserUpload && !canViewPending) {
      throw ApiError.notFound('Painting not found');
    }

    let viewCount = painting.viewCount;
    if (trackView) {
      // Atomic view increment; record history for signed-in viewers.
      await prisma.painting.update({
        where: { id: painting.id },
        data: { viewCount: { increment: 1 } },
      });
      if (viewer?.id) {
        await prisma.viewHistory.create({
          data: { userId: viewer.id, paintingId: painting.id },
        });
      }
      viewCount += 1;
    }

    return withFavoriteState({ ...painting, viewCount }, viewer);
  },

  // Content-based "similar" lookup: same style/category, ranked by shared
  // dominant colours, excluding the source painting.
  async getSimilar(paintingId, limit = 6) {
    const source = await prisma.painting.findUnique({ where: { id: paintingId } });
    if (!source) throw ApiError.notFound('Painting not found');

    const candidates = await prisma.painting.findMany({
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
      prisma.painting.findUnique({ where: { slug: s } }).then(Boolean),
    );
    return prisma.painting.create({
      data: { ...clean, slug },
      include: includeRefs,
    });
  },

  async createUserUpload({
    userId, title, description, artistName,
    categoryId, styleId, medium, surface, year,
    imageUrl, thumbnailUrl, dominantColors,
  }) {
    const cleanArtistName = String(artistName || '').trim();
    let artist = await prisma.artist.findFirst({ where: { name: cleanArtistName } });
    if (!artist) {
      const artistSlug = await uniqueSlug(cleanArtistName, (s) =>
        prisma.artist.findUnique({ where: { slug: s } }).then(Boolean),
      );
      artist = await prisma.artist.create({ data: { name: cleanArtistName, slug: artistSlug } });
    }

    const cleanTitle = String(title || '').trim();
    const slug = await uniqueSlug(cleanTitle, (s) =>
      prisma.painting.findUnique({ where: { slug: s } }).then(Boolean),
    );

    return prisma.painting.create({
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
    return prisma.painting.findMany({
      where: { uploadedById: userId },
      orderBy: { createdAt: 'desc' },
      include: includeRefs,
    });
  },

  async update(id, data) {
    return prisma.painting.update({ where: { id }, data: sanitizePaintingData(data), include: includeRefs });
  },

  async remove(id) {
    await prisma.painting.delete({ where: { id } });
  },

  async saveAiSummary(id, summary) {
    return prisma.painting.update({ where: { id }, data: { aiSummary: summary } });
  },
};
