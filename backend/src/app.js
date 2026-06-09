import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/user/user.routes.js';
import paintingRoutes from './modules/painting/painting.routes.js';
import artistRoutes from './modules/artist/artist.routes.js';
import categoryRoutes from './modules/category/category.routes.js';
import favoriteRoutes from './modules/favorite/favorite.routes.js';
import searchRoutes from './modules/search/search.routes.js';
import recommendationRoutes from './modules/recommendation/recommendation.routes.js';
import chatbotRoutes from './modules/chatbot/chatbot.routes.js';
import recognitionRoutes from './modules/recognition/recognition.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors({ origin: env.clientOrigin, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  if (env.nodeEnv !== 'test') app.use(morgan('dev'));

  app.get('/api/health', (_req, res) =>
    res.json({ success: true, data: { status: 'ok', uptime: process.uptime() } }));

  app.use('/api', apiLimiter);
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/paintings', paintingRoutes);
  app.use('/api/artists', artistRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/favorites', favoriteRoutes);
  app.use('/api/search', searchRoutes);
  app.use('/api/recommendations', recommendationRoutes);
  app.use('/api/chatbot', chatbotRoutes);
  app.use('/api/recognition', recognitionRoutes);
  app.use('/api/analytics', analyticsRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
