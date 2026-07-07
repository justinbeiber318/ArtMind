import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../config/database.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { uniqueSlug } from '../../utils/slug.js';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';

const router = Router();
const bodySchema = z.object({ body: z.object({ name: z.string().min(2) }) });

async function uniqueSlugForModel(model, name, currentId) {
  return uniqueSlug(name, async (s) => {
    const item = await db[model].findUnique({ where: { slug: s } });
    return Boolean(item && item.id !== currentId);
  });
}

// Categories with painting counts — drives the "Trending Categories" home section.
router.get('/', asyncHandler(async (_req, res) => {
  const items = await db.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { paintings: true } } },
  });
  res.json({ success: true, data: items });
}));

router.get('/styles', asyncHandler(async (_req, res) => {
  const items = await db.style.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { paintings: true } } },
  });
  res.json({ success: true, data: items });
}));

router.get('/surfaces', asyncHandler(async (_req, res) => {
  const groups = await db.painting.groupBy({
    by: ['surface'],
    where: { surface: { not: null } },
    _count: { surface: true },
    orderBy: { surface: 'asc' },
  });
  const items = groups
    .filter((item) => item.surface?.trim())
    .map((item) => ({
      name: item.surface,
      _count: { paintings: item._count.surface },
    }));
  res.json({ success: true, data: items });
}));

router.post('/', requireAuth, requireAdmin, validate(bodySchema), asyncHandler(async (req, res) => {
  const slug = await uniqueSlug(req.body.name, (s) =>
    db.category.findUnique({ where: { slug: s } }).then(Boolean));
  const cat = await db.category.create({ data: { name: req.body.name, slug } });
  res.status(201).json({ success: true, data: cat });
}));

router.post('/styles', requireAuth, requireAdmin, validate(bodySchema), asyncHandler(async (req, res) => {
  const slug = await uniqueSlug(req.body.name, (s) =>
    db.style.findUnique({ where: { slug: s } }).then(Boolean));
  const style = await db.style.create({ data: { name: req.body.name, slug } });
  res.status(201).json({ success: true, data: style });
}));

router.patch('/styles/:id', requireAuth, requireAdmin, validate(bodySchema), asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const slug = await uniqueSlugForModel('style', req.body.name, id);
  const style = await db.style.update({
    where: { id },
    data: { name: req.body.name, slug },
    include: { _count: { select: { paintings: true } } },
  });
  res.json({ success: true, data: style });
}));

router.delete('/styles/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  await db.style.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true, data: { message: 'Style deleted' } });
}));

router.patch('/surfaces/:name', requireAuth, requireAdmin, validate(bodySchema), asyncHandler(async (req, res) => {
  const currentName = decodeURIComponent(req.params.name);
  await db.painting.updateMany({
    where: { surface: currentName },
    data: { surface: req.body.name },
  });
  res.json({ success: true, data: { name: req.body.name } });
}));

router.delete('/surfaces/:name', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const currentName = decodeURIComponent(req.params.name);
  await db.painting.updateMany({
    where: { surface: currentName },
    data: { surface: null },
  });
  res.json({ success: true, data: { message: 'Surface removed from paintings' } });
}));

router.patch('/:id', requireAuth, requireAdmin, validate(bodySchema), asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const slug = await uniqueSlugForModel('category', req.body.name, id);
  const cat = await db.category.update({
    where: { id },
    data: { name: req.body.name, slug },
    include: { _count: { select: { paintings: true } } },
  });
  res.json({ success: true, data: cat });
}));

router.delete('/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  await db.category.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true, data: { message: 'Category deleted' } });
}));

export default router;
