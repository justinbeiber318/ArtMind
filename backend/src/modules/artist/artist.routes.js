import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../config/database.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { uniqueSlug } from '../../utils/slug.js';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { getPagination, buildMeta } from '../../utils/pagination.js';

const router = Router();

const bodySchema = z.object({
  body: z.object({
    name: z.string().min(2),
    nationality: z.string().optional(),
    bornYear: z.number().int().optional(),
    diedYear: z.number().int().optional(),
    bio: z.string().optional(),
    portraitUrl: z.string().url().optional(),
  }),
});

router.get('/', asyncHandler(async (req, res) => {
  const { page, limit, skip, take } = getPagination(req.query, 20);
  const [items, total] = await Promise.all([
    db.artist.findMany({
      skip, take, orderBy: { name: 'asc' },
      include: { _count: { select: { paintings: true } } },
    }),
    db.artist.count(),
  ]);
  res.json({ success: true, data: items, meta: buildMeta(page, limit, total) });
}));

// Popular artists ranked by aggregate views across their paintings.
router.get('/popular', asyncHandler(async (_req, res) => {
  const rows = await db.painting.groupBy({
    by: ['artistId'],
    _sum: { viewCount: true },
    orderBy: { _sum: { viewCount: 'desc' } },
    take: 8,
  });
  const artists = await db.artist.findMany({
    where: { id: { in: rows.map((r) => r.artistId) } },
  });
  const byId = new Map(artists.map((a) => [a.id, a]));
  const data = rows.map((r) => ({ ...byId.get(r.artistId), totalViews: r._sum.viewCount || 0 }));
  res.json({ success: true, data });
}));

router.get('/:slug', asyncHandler(async (req, res) => {
  const artist = await db.artist.findUnique({
    where: { slug: req.params.slug },
    include: { paintings: { include: { category: true, style: true } } },
  });
  if (!artist) throw ApiError.notFound('Artist not found');
  res.json({ success: true, data: artist });
}));

router.post('/', requireAuth, requireAdmin, validate(bodySchema), asyncHandler(async (req, res) => {
  const slug = await uniqueSlug(req.body.name, (s) =>
    db.artist.findUnique({ where: { slug: s } }).then(Boolean));
  const artist = await db.artist.create({ data: { ...req.body, slug } });
  res.status(201).json({ success: true, data: artist });
}));

router.patch('/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const artist = await db.artist.update({ where: { id: Number(req.params.id) }, data: req.body });
  res.json({ success: true, data: artist });
}));

router.delete('/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const count = await db.painting.count({ where: { artistId: id } });
  if (count > 0) {
    throw ApiError.badRequest(`Cannot delete this artist — ${count} painting(s) still reference them. Delete those paintings first.`);
  }
  await db.artist.delete({ where: { id } });
  res.json({ success: true, data: { message: 'Artist deleted' } });
}));

export default router;
