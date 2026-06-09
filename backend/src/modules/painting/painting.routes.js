import { Router } from 'express';
import { paintingController } from './painting.controller.js';
import { requireAuth, requireAdmin, optionalAuth } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { aiLimiter } from '../../middleware/rateLimit.js';
import { createSchema, updateSchema } from './painting.validation.js';

const router = Router();

router.get('/', paintingController.list);
router.get('/:slug', optionalAuth, paintingController.detail);
router.get('/:slug/ai-summary', aiLimiter, paintingController.aiSummary);
router.get('/:id/similar', paintingController.similar);

router.post('/', requireAuth, requireAdmin, validate(createSchema), paintingController.create);
router.patch('/:id', requireAuth, requireAdmin, validate(updateSchema), paintingController.update);
router.delete('/:id', requireAuth, requireAdmin, paintingController.remove);

export default router;
