import { Router } from 'express';
import { z } from 'zod';
import { userController } from './user.controller.js';
import { requireAuth, requireAdmin, requireUser } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { upload } from '../../middleware/upload.js';

const router = Router();

const updateSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80).optional(),
    bio: z.string().max(2000).optional(),
    avatarUrl: z.string().url().optional(),
  }),
});

const passwordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  }),
});

router.use(requireAuth);
router.get('/me', userController.me);
router.patch('/me', requireUser, validate(updateSchema), userController.updateMe);
router.post('/me/avatar', requireUser, upload.single('avatar'), userController.uploadAvatar);
router.patch('/me/password', requireUser, validate(passwordSchema), userController.changePassword);
router.get('/dashboard', requireUser, userController.dashboard);

// admin
router.get('/', requireAdmin, userController.list);
router.patch('/:id/role', requireAdmin, userController.setRole);
router.delete('/:id', requireAdmin, userController.remove);

export default router;
