import { Router } from 'express';
import { analyticsService } from './analytics.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireAdmin);

router.get('/overview', asyncHandler(async (_req, res) =>
  res.json({ success: true, data: await analyticsService.overview() })));

router.get('/most-viewed', asyncHandler(async (_req, res) =>
  res.json({ success: true, data: await analyticsService.mostViewedPaintings() })));

router.get('/categories', asyncHandler(async (_req, res) =>
  res.json({ success: true, data: await analyticsService.popularCategories() })));

router.get('/styles', asyncHandler(async (_req, res) =>
  res.json({ success: true, data: await analyticsService.trendingStyles() })));

router.get('/user-growth', asyncHandler(async (_req, res) =>
  res.json({ success: true, data: await analyticsService.userGrowth() })));

router.get('/ai-logs', asyncHandler(async (_req, res) =>
  res.json({ success: true, data: await analyticsService.aiLogs() })));

export default router;
