import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { uniqueSlug } from '../../utils/slug.js';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';

const router = Router();
const bodySchema = z.object({ body: z.object({ name: z.string().min(2) }) });

// Categories with painting counts — drives the "Trending Categories" home section.
router.get('/', asyncHandler(async (_req, res) => {
  const items = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { paintings: true } } },
  });
  res.json({ success: true, data: items });
}));

router.get('/styles', asyncHandler(async (_req, res) => {
  const items = await prisma.style.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { paintings: true } } },
  });
  res.json({ success: true, data: items });
}));

router.post('/', requireAuth, requireAdmin, validate(bodySchema), asyncHandler(async (req, res) => {
  const slug = await uniqueSlug(req.body.name, (s) =>
    prisma.category.findUnique({ where: { slug: s } }).then(Boolean));
  const cat = await prisma.category.create({ data: { name: req.body.name, slug } });
  res.status(201).json({ success: true, data: cat });
}));

router.post('/styles', requireAuth, requireAdmin, validate(bodySchema), asyncHandler(async (req, res) => {
  const slug = await uniqueSlug(req.body.name, (s) =>
    prisma.style.findUnique({ where: { slug: s } }).then(Boolean));
  const style = await prisma.style.create({ data: { name: req.body.name, slug } });
  res.status(201).json({ success: true, data: style });
}));

router.delete('/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  await prisma.category.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true, data: { message: 'Category deleted' } });
}));

export default router;
