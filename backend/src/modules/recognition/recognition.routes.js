import { Router } from 'express';
import { recognitionService } from './recognition.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { optionalAuth, requireAuth, requireUser } from '../../middleware/auth.js';
import { upload } from '../../middleware/upload.js';
import { aiLimiter } from '../../middleware/rateLimit.js';
import { saveImage } from '../../utils/storage.js';

const router = Router();

router.post('/', aiLimiter, optionalAuth, upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No image uploaded (field name: "image")');

  const { imageUrl, thumbnailUrl } = await saveImage(req.file.buffer, req.file.mimetype, req);

  const result = await recognitionService.analyze(req.file.buffer, req.user?.id, imageUrl, thumbnailUrl);
  res.json({ success: true, data: result });
}));

router.get('/history', requireAuth, requireUser, asyncHandler(async (req, res) => {
  res.json({ success: true, data: await recognitionService.history(req.user.id) });
}));

router.get('/history/:id', requireAuth, requireUser, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: await recognitionService.getHistoryItem(req.user.id, Number(req.params.id)),
  });
}));

router.delete('/history/:id', requireAuth, requireUser, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: await recognitionService.deleteHistoryItem(req.user.id, Number(req.params.id)),
  });
}));

export default router;
