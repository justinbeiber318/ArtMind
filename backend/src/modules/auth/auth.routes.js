import { Router } from 'express';
import { authController } from './auth.controller.js';
import { validate } from '../../middleware/validate.js';
import { optionalAuth } from '../../middleware/auth.js';
import { authLimiter } from '../../middleware/rateLimit.js';
import { registerSchema, loginSchema } from './auth.validation.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', optionalAuth, authController.logout);

export default router;
