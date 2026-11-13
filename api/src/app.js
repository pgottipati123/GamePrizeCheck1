import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { createApiRouter } from './routes/index.js';
import { createSupabaseRepository } from './services/catalogRepository.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp(config, { repository = createSupabaseRepository(config) } = {}) {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin: config.corsOrigins,
      methods: ['GET', 'PATCH'],
      allowedHeaders: ['Content-Type', 'X-Admin-Key'],
    }),
  );
  app.use(
    '/api',
    rateLimit({
      windowMs: 60_000,
      limit: config.rateLimitPerMinute,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
    }),
  );
  app.use(express.json({ limit: '100kb' }));

  app.use('/api', createApiRouter({ config, repository }));

  app.use(notFound);
  app.use(errorHandler(config));

  return app;
}
