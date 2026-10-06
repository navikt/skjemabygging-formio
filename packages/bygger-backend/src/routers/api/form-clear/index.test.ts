import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import express from 'express';
import type { Server } from 'node:http';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  config: { naisClusterName: 'dev-gcp' },
  preview: vi.fn(),
  start: vi.fn(),
  getJob: vi.fn(),
  getActiveJob: vi.fn(),
  getExistingPaths: vi.fn(),
  cleanup: vi.fn(),
  exchangeToken: vi.fn(),
}));

vi.mock('../../../config', () => ({ default: mocks.config }));
vi.mock('../../../services', () => ({
  formClearService: {
    preview: mocks.preview,
    start: mocks.start,
    getJob: mocks.getJob,
    getActiveJob: mocks.getActiveJob,
    getExistingPaths: mocks.getExistingPaths,
  },
  formClearPublishService: { cleanup: mocks.cleanup },
}));
vi.mock('../helpers/authHandlers', () => ({
  default: {
    formsApiAuthHandler: (req: express.Request, _res: express.Response, next: express.NextFunction) => {
      mocks.exchangeToken();
      req.headers.AzureAccessToken = 'obo-token';
      next();
    },
  },
}));

import router from './index';

describe('form clear admin routes', () => {
  let server: Server;
  let baseUrl: string;
  let isAdmin = true;

  beforeEach(async () => {
    vi.clearAllMocks();
    mocks.config.naisClusterName = 'dev-gcp';
    isAdmin = true;
    mocks.preview.mockResolvedValue({ toDelete: ['old'], kept: ['kept'] });
    mocks.start.mockResolvedValue({ jobId: 'job-1' });
    mocks.getActiveJob.mockResolvedValue({ jobId: 'job-1', status: 'running', items: [] });
    mocks.getExistingPaths.mockResolvedValue(['kept']);
    mocks.cleanup.mockResolvedValue({ removed: ['old'], failed: [] });
    const app = express();
    app.use(
      express.json(),
      (req, _res, next) => {
        req.getUser = () => ({ isAdmin }) as ReturnType<typeof req.getUser>;
        next();
      },
      router,
    );
    server = await new Promise((resolve) => {
      const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
    });
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Missing test server address');
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterEach(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  const post = (baseUrl: string, path: string, body?: object) =>
    fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      ...(body && { body: JSON.stringify(body) }),
    });

  it('refuses every route in prod before admin or token exchange', async () => {
    mocks.config.naisClusterName = 'prod-gcp';
    for (const path of ['/preview', '/jobs', '/publish-cleanup']) {
      expect((await post(baseUrl, path)).status).toBe(405);
    }
    expect((await fetch(`${baseUrl}/jobs/job-1`)).status).toBe(405);
    expect((await fetch(`${baseUrl}/jobs/active`)).status).toBe(405);
    expect(mocks.exchangeToken).not.toHaveBeenCalled();
    expect(mocks.cleanup).not.toHaveBeenCalled();
  });

  it('refuses non-admin users without exchanging a token', async () => {
    isAdmin = false;
    expect((await post(baseUrl, '/publish-cleanup')).status).toBe(403);
    expect((await fetch(`${baseUrl}/jobs/active`)).status).toBe(403);
    expect(mocks.exchangeToken).not.toHaveBeenCalled();
  });

  it('validates the keep-set and forwards authorized requests with the exchanged token', async () => {
    expect((await post(baseUrl, '/preview', { keepTestForms: true })).status).toBe(400);
    const options = { keepTestForms: true, keepLockedForms: true, keepFormPaths: ['nested/kept'] };
    const startRequest = { ...options, expectedToDelete: ['nested/old'], expectedKept: ['nested/kept'] };
    expect((await post(baseUrl, '/preview', options)).status).toBe(200);
    expect(mocks.preview).toHaveBeenCalledWith(options, 'obo-token');
    expect((await post(baseUrl, '/jobs', options)).status).toBe(400);
    expect((await post(baseUrl, '/jobs', { ...options, expectedToDelete: ['old'] })).status).toBe(400);
    expect(mocks.start).not.toHaveBeenCalled();
    expect((await post(baseUrl, '/jobs', startRequest)).status).toBe(201);
    expect(mocks.start).toHaveBeenCalledWith(startRequest, 'obo-token');
    expect((await fetch(`${baseUrl}/jobs/active`)).status).toBe(200);
    expect(mocks.getActiveJob).toHaveBeenCalledWith('obo-token');
    expect(mocks.getJob).not.toHaveBeenCalled();
    expect((await post(baseUrl, '/publish-cleanup')).status).toBe(200);
    expect(mocks.getExistingPaths).toHaveBeenCalledWith('obo-token');
    expect(mocks.cleanup).toHaveBeenCalledWith(['kept']);
  });

  it('forwards not-found when there is no active job', async () => {
    mocks.getActiveJob.mockRejectedValue(new ResponseError('NOT_FOUND', 'No active clear job'));
    expect((await fetch(`${baseUrl}/jobs/active`)).status).toBe(404);
  });
});
