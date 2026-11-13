import cors from 'cors';
import express, { type Express } from 'express';
import { DomainError } from './domain/errors.js';
import { createApiRouter } from './routes/index.js';

export function createApp(): Express {
  const app = express();

  app.use(express.json());
  app.use(cors());
  app.use('/api', createApiRouter());

  app.use((error: unknown, _request: express.Request, response: express.Response, next: express.NextFunction) => {
    if (response.headersSent) {
      next(error);
      return;
    }
    if (error instanceof DomainError) {
      response.status(error.status).json({ error: { code: error.code, message: error.message } });
      return;
    }
    console.error(error);
    response.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Внутренняя ошибка сервера' },
    });
  });

  return app;
}
