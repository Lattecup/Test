import { Router } from 'express';

/** Заглушка доменного эндпоинта: серверное хранение данных ещё не реализовано. */
export function notImplementedRouter(resource: string): Router {
  const router = Router();
  router.all('/', (request, response) => {
    response.status(501).json({
      error: {
        code: 'NOT_IMPLEMENTED',
        message: `Серверное хранение данных ещё не реализовано: ${resource}`,
        method: request.method,
        path: request.path,
      },
    });
  });
  return router;
}
