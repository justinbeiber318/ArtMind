import { paintingService } from './painting.service.js';
import { chatbotService } from '../chatbot/chatbot.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { extractDominantColors } from '../recognition/colorExtractor.js';
import { ApiError } from '../../utils/ApiError.js';
import { saveImage } from '../../utils/storage.js';
import { getPagination, buildMeta } from '../../utils/pagination.js';

export const paintingController = {
  list: asyncHandler(async (req, res) => {
    const { page, limit, skip, take } = getPagination(req.query);
    const { items, total } = await paintingService.list(req.query, { skip, take });
    res.json({ success: true, data: items, meta: buildMeta(page, limit, total) });
  }),

  detail: asyncHandler(async (req, res) => {
    const painting = await paintingService.getBySlug(req.params.slug, req.user?.id);
    res.json({ success: true, data: painting });
  }),

  similar: asyncHandler(async (req, res) => {
    const similar = await paintingService.getSimilar(Number(req.params.id));
    res.json({ success: true, data: similar });
  }),

  // Generates (and caches) an AI summary for a painting on demand.
  aiSummary: asyncHandler(async (req, res) => {
    const painting = await paintingService.getBySlug(req.params.slug, undefined);
    if (painting.aiSummary) {
      return res.json({ success: true, data: { summary: painting.aiSummary, cached: true } });
    }
    const summary = await chatbotService.summarisePainting(painting);
    await paintingService.saveAiSummary(painting.id, summary);
    return res.json({ success: true, data: { summary, cached: false } });
  }),

  create: asyncHandler(async (req, res) => {
    res.status(201).json({ success: true, data: await paintingService.create(req.body) });
  }),

  uploadByUser: asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest('No image uploaded (field name: "image")');
    const { title, description, artistName, categoryId, styleId, medium, surface, year } = req.body;
    if (!title || !description || !artistName || !categoryId) {
      throw ApiError.badRequest('title, description, artistName and categoryId are required');
    }

    const { imageUrl, thumbnailUrl } = await saveImage(req.file.buffer, req.file.mimetype, req);

    let dominantColors = [];
    try {
      dominantColors = await extractDominantColors(req.file.buffer, 5);
    } catch {
      /* non-fatal */
    }

    const painting = await paintingService.createUserUpload({
      userId: req.user.id,
      title, description, artistName,
      categoryId, styleId, medium, surface, year,
      imageUrl, thumbnailUrl, dominantColors,
    });
    res.status(201).json({ success: true, data: painting });
  }),

  mine: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await paintingService.listByUploader(req.user.id) });
  }),

  update: asyncHandler(async (req, res) => {
    res.json({ success: true, data: await paintingService.update(Number(req.params.id), req.body) });
  }),

  remove: asyncHandler(async (req, res) => {
    await paintingService.remove(Number(req.params.id));
    res.json({ success: true, data: { message: 'Painting deleted' } });
  }),
};
