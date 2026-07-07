import { Router } from 'express';
import { db } from '../../config/database.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { requireAuth, requireUser } from '../../middleware/auth.js';
import { recommendationService } from '../recommendation/recommendation.service.js';

const router = Router();
router.use(requireAuth);
router.use(requireUser);

const publicPaintingWhere = {
  OR: [
    { uploadedById: null },
    { featured: true },
  ],
};

router.get('/', asyncHandler(async (req, res) => {
<<<<<<< HEAD
  const favorites = await prisma.favorite.findMany({
    where: { userId: req.user.id, painting: publicPaintingWhere },
=======
  const favorites = await db.favorite.findMany({
    where: { userId: req.user.id },
>>>>>>> 561a62b9d81ee3d723357fedb9ff4b465d876d4c
    orderBy: { createdAt: 'desc' },
    include: { painting: { include: { artist: true, style: true, category: true } } },
  });
  res.json({ success: true, data: favorites.map((f) => ({ ...f.painting, isFavorited: true })) });
}));

// Toggle: favourite if absent, un-favourite if present. Recompute recs async.
router.post('/:paintingId', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const paintingId = Number(req.params.paintingId);
<<<<<<< HEAD
  if (!Number.isInteger(paintingId) || paintingId <= 0) {
    throw ApiError.badRequest('Invalid painting id');
  }

  const painting = await prisma.painting.findFirst({
    where: { id: paintingId, ...publicPaintingWhere },
    select: { id: true },
  });
  if (!painting) throw ApiError.notFound('Painting not found');

  const existing = await prisma.favorite.findUnique({
=======
  const existing = await db.favorite.findUnique({
>>>>>>> 561a62b9d81ee3d723357fedb9ff4b465d876d4c
    where: { userId_paintingId: { userId, paintingId } },
  });

  let favorited;
  if (existing) {
    await db.favorite.delete({ where: { id: existing.id } });
    favorited = false;
  } else {
    await db.favorite.create({ data: { userId, paintingId } });
    favorited = true;
  }

  // Rebuild recommendations in the background; don't block the response.
  recommendationService.rebuildForUser(userId).catch((e) => console.error('rec rebuild', e));

  res.json({ success: true, data: { favorited } });
}));

export default router;
