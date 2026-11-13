import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../app.js';

describe('сервер приложения', () => {
  it('отвечает на health-запрос', async () => {
    const response = await request(createApp()).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('возвращает 501 на доменные эндпоинты', async () => {
    const response = await request(createApp()).get('/api/operations');
    expect(response.status).toBe(501);
    expect(response.body.error.code).toBe('NOT_IMPLEMENTED');
  });

  it('возвращает 501 на создание операции', async () => {
    const response = await request(createApp())
      .post('/api/operations')
      .send({ type: 'expense', amount: 1000, date: '2026-03-10' });
    expect(response.status).toBe(501);
  });

  it('возвращает 501 на запрос отчёта', async () => {
    const response = await request(createApp()).get('/api/reports?from=2026-03-01&to=2026-03-31');
    expect(response.status).toBe(501);
  });
});
