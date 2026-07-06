import { Router } from 'express';
import { db } from '../../config/database.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireAuth, requireUser } from '../../middleware/auth.js';
import { recommendationService } from '../recommendation/recommendation.service.js';

const router = Router();
router.use(requireAuth);
router.use(requireUser);

router.get('/', asyncHandler(async (req, res) => {
  const favorites = await db.favorite.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    include: { painting: { include: { artist: true, style: true, category: true } } },
  });
  res.json({ success: true, data: favorites.map((f) => f.painting) });
}));

// Toggle: favourite if absent, un-favourite if present. Recompute recs async.
router.post('/:paintingId', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const paintingId = Number(req.params.paintingId);
  const existing = await db.favorite.findUnique({
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
