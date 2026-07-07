import { Router } from 'express';
import { z } from 'zod';
import { userController } from './user.controller.js';
import { requireAuth, requireAdmin, requireUser } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { upload } from '../../middleware/upload.js';

const router = Router();

const nullableUrl = z.string().url().nullable().optional();

const updateSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80).optional(),
    bio: z.string().max(2000).nullable().optional(),
    avatarUrl: nullableUrl,
  }),
});

const passwordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  }),
});

const adminUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80),
    email: z.string().email(),
    password: z.string().min(8),
    avatarUrl: nullableUrl,
    bio: z.string().max(2000).nullable().optional(),
    role: z.enum(['USER', 'ADMIN']).optional(),
    status: z.enum(['Active', 'Blocked']).optional(),
  }),
});

const adminUserUpdateSchema = z.object({
  body: adminUserSchema.shape.body.extend({
    password: z.string().min(8).optional(),
  }).partial(),
});

const statusSchema = z.object({
  body: z.object({ status: z.enum(['Active', 'Blocked']) }),
});

const roleSchema = z.object({
  body: z.object({ role: z.enum(['USER', 'ADMIN']) }),
});

router.use(requireAuth);
router.get('/me', userController.me);
router.patch('/me', requireUser, validate(updateSchema), userController.updateMe);
router.post('/me/avatar', requireUser, upload.single('avatar'), userController.uploadAvatar);
router.patch('/me/password', requireUser, validate(passwordSchema), userController.changePassword);
router.get('/dashboard', requireUser, userController.dashboard);

// admin
router.get('/', requireAdmin, userController.list);
router.post('/', requireAdmin, validate(adminUserSchema), userController.create);
router.patch('/:id', requireAdmin, validate(adminUserUpdateSchema), userController.update);
router.patch('/:id/role', requireAdmin, validate(roleSchema), userController.setRole);
router.patch('/:id/status', requireAdmin, validate(statusSchema), userController.setStatus);
router.delete('/:id', requireAdmin, userController.remove);

export default router;
