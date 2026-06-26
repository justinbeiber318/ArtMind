import { Router } from 'express';
import { recommendationService } from './recommendation.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireAuth, requireUser, optionalAuth } from '../../middleware/auth.js';

const router = Router();

router.get('/preview', optionalAuth, asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await recommendationService.getTrendingPreview() });
}));

router.get('/', requireAuth, requireUser, asyncHandler(async (req, res) => {
  res.json({ success: true, data: await recommendationService.getForUser(req.user.id) });
}));

router.post('/rebuild', requireAuth, requireUser, asyncHandler(async (req, res) => {
  const count = await recommendationService.rebuildForUser(req.user.id);
  res.json({ success: true, data: { generated: count } });
}));

export default router;
