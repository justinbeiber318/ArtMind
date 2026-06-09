import { Router } from 'express';
import { recognitionService } from './recognition.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { optionalAuth } from '../../middleware/auth.js';
import { upload } from '../../middleware/upload.js';
import { aiLimiter } from '../../middleware/rateLimit.js';
import { env } from '../../config/env.js';
import { uploadToCloudinary } from '../../config/cloudinary.js';

const router = Router();

router.post('/', aiLimiter, optionalAuth, upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No image uploaded (field name: "image")');

  // Persist the upload to Cloudinary when configured; otherwise analyse in-memory.
  let imageUrl = '';
  if (env.cloudinary.cloudName) {
    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    ({ url: imageUrl } = await uploadToCloudinary(dataUri, 'artmind/uploads'));
  }

  const result = await recognitionService.analyze(req.file.buffer, req.user?.id, imageUrl);
  res.json({ success: true, data: { ...result, imageUrl } });
}));

export default router;
