import { Router } from 'express';
import { z } from 'zod';
import { searchService } from './search.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { validate } from '../../middleware/validate.js';
import { getPagination, buildMeta } from '../../utils/pagination.js';
import { aiLimiter } from '../../middleware/rateLimit.js';

const router = Router();

const schema = z.object({
  body: z.object({ query: z.string().min(2).max(200) }),
});

router.post('/', aiLimiter, validate(schema), asyncHandler(async (req, res) => {
  const { page, limit, skip, take } = getPagination(req.query);
  const { filters, items, total } = await searchService.search(req.body.query, { skip, take });
  res.json({
    success: true,
    data: items,
    meta: { ...buildMeta(page, limit, total), parsedFilters: filters },
  });
}));

export default router;
