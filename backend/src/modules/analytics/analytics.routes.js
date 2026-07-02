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

router.get('/export', asyncHandler(async (_req, res) => {
  const csv = await analyticsService.exportPaintingsCsv();
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=paintings_performance_report.csv');
  return res.status(200).send(csv);
}));

router.post('/quick-actions/recalculate-trending', asyncHandler(async (_req, res) =>
  res.json({ success: true, data: await analyticsService.recalculateTrending() })));

router.post('/quick-actions/rebuild-recommendations', asyncHandler(async (_req, res) =>
  res.json({ success: true, data: await analyticsService.rebuildAllRecommendations() })));

router.post('/quick-actions/clean-logs', asyncHandler(async (_req, res) =>
  res.json({ success: true, data: await analyticsService.cleanChatLogs() })));

router.get('/quick-actions/health', asyncHandler(async (_req, res) =>
  res.json({ success: true, data: await analyticsService.systemHealth() })));

export default router;
