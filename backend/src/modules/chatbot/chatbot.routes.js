import { Router } from 'express';
import { z } from 'zod';
import { chatbotService } from './chatbot.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { validate } from '../../middleware/validate.js';
import { optionalAuth } from '../../middleware/auth.js';
import { aiLimiter } from '../../middleware/rateLimit.js';

const router = Router();

const schema = z.object({
  body: z.object({
    message: z.string().min(1).max(1000),
    history: z.array(z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })).optional(),
  }),
});

router.post('/', aiLimiter, optionalAuth, validate(schema), asyncHandler(async (req, res) => {
  const result = await chatbotService.chat({
    message: req.body.message,
    history: req.body.history,
    userId: req.user?.id,
  });
  res.json({ success: true, data: result });
}));

export default router;
