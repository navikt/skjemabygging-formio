import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const m2mHandler = vi.fn((_, res, next) => {
  res.set('x-auth-handler', 'm2m');
  next();
});

const oboHandler = vi.fn((_, res, next) => {
  res.set('x-auth-handler', 'obo');
  next();
});

vi.mock('../../middleware/entraIdHandlers', () => ({
  entraIdM2mHandler: m2mHandler,
  entraIdOboHandler: oboHandler,
}));

vi.mock('./formSpecRouter', async () => {
  const express = await import('express');
  const router = express.default.Router();

  router.get('/:formPath/spec', (_req, res) => {
    res.sendStatus(204);
  });

  return {
    default: router,
  };
});

describe('apiRouter auth wiring', () => {
  beforeEach(() => {
    m2mHandler.mockClear();
    oboHandler.mockClear();
  });

  it('uses the M2M handler for /forms routes', async () => {
    const { default: apiRouter } = await import('./index');
    const app = express();

    app.use('/api', apiRouter);

    const response = await request(app).get('/api/forms/nav123456/spec').expect(204);

    expect(response.header['x-auth-handler']).toBe('m2m');
    expect(m2mHandler).toHaveBeenCalledTimes(1);
    expect(oboHandler).not.toHaveBeenCalled();
  });

  it('uses the OBO handler for /employee/forms routes', async () => {
    const { default: apiRouter } = await import('./index');
    const app = express();

    app.use('/api', apiRouter);

    const response = await request(app).get('/api/employee/forms/nav123456/spec').expect(204);

    expect(response.header['x-auth-handler']).toBe('obo');
    expect(oboHandler).toHaveBeenCalledTimes(1);
    expect(m2mHandler).not.toHaveBeenCalled();
  });
});
