import { Router } from 'express';
import { z } from 'zod';
import { userController } from './user.controller.js';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';

const router = Router();

const updateSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80).optional(),
    bio: z.string().max(2000).optional(),
    avatarUrl: z.string().url().optional(),
  }),
});

router.use(requireAuth);
router.get('/me', userController.me);
router.patch('/me', validate(updateSchema), userController.updateMe);
router.get('/dashboard', userController.dashboard);

// admin
router.get('/', requireAdmin, userController.list);
router.patch('/:id/role', requireAdmin, userController.setRole);
router.delete('/:id', requireAdmin, userController.remove);

export default router;
