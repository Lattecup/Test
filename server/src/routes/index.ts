import { Router } from 'express';
import { notImplementedRouter } from './notImplemented.js';

export function createApiRouter(): Router {
  const router = Router();

  router.get('/health', (_request, response) => {
    response.json({ status: 'ok' });
  });

  router.use('/accounts', notImplementedRouter('счета'));
  router.use('/categories', notImplementedRouter('категории'));
  router.use('/operations', notImplementedRouter('операции'));
  router.use('/reports', notImplementedRouter('отчёты'));
  router.use('/settings', notImplementedRouter('настройки'));

  return router;
}
