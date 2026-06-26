import { Router } from 'express';
import { paintingController } from './painting.controller.js';
import { requireAuth, requireAdmin, requireUser, optionalAuth } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { upload } from '../../middleware/upload.js';
import { aiLimiter } from '../../middleware/rateLimit.js';
import { createSchema, updateSchema } from './painting.validation.js';

const router = Router();

router.get('/', paintingController.list);

// Specific routes MUST come before the dynamic "/:slug" route.
router.get('/admin/all', requireAuth, requireAdmin, paintingController.adminList);
router.get('/mine', requireAuth, requireUser, paintingController.mine);
router.post('/upload', requireAuth, requireUser, upload.single('image'), paintingController.uploadByUser);

router.get('/:slug', optionalAuth, paintingController.detail);
router.get('/:slug/ai-summary', aiLimiter, paintingController.aiSummary);
router.get('/:id/similar', paintingController.similar);

router.post('/', requireAuth, requireAdmin, validate(createSchema), paintingController.create);
router.patch('/:id', requireAuth, requireAdmin, validate(updateSchema), paintingController.update);
router.delete('/:id', requireAuth, requireAdmin, paintingController.remove);

export default router;
