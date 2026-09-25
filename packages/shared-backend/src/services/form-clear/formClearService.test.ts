import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFormClearService } from './formClearService';

describe('form clear service', () => {
  const service = createFormClearService('https://forms-api.test');
  const options = { keepTestForms: true, keepLockedForms: false, keepFormPaths: ['nested/example'] };
  const startRequest = { ...options, expectedToDelete: ['one'], expectedKept: ['nested/example'] };

  afterEach(() => vi.restoreAllMocks());

  it('passes the keep-set and bearer token to preview and start', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ toDelete: ['one'], kept: ['nested/example'] }), {
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ jobId: 'job-1' }), { headers: { 'Content-Type': 'application/json' } }),
      );
    await expect(service.preview(options, 'token')).resolves.toEqual({ toDelete: ['one'], kept: ['nested/example'] });
    await expect(service.start(startRequest, 'token')).resolves.toEqual({ jobId: 'job-1' });
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://forms-api.test/api/database-cleanup/preview',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(options),
        headers: expect.objectContaining({ Authorization: 'Bearer token' }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://forms-api.test/api/database-cleanup/jobs',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(startRequest),
      }),
    );
  });

  it('gets a job and all existing form paths, including soft-deleted forms', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ jobId: 'job-1', status: 'completed', items: [] }), {
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ jobId: 'job-2', status: 'running', items: [] }), {
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify([{ path: 'nested/example' }, { path: 'soft-deleted/kept' }]), {
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    await expect(service.getJob('job-1', 'token')).resolves.toMatchObject({ status: 'completed' });
    await expect(service.getActiveJob('token')).resolves.toMatchObject({ jobId: 'job-2', status: 'running' });
    await expect(service.getExistingPaths('token')).resolves.toEqual(['nested/example', 'soft-deleted/kept']);
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      'https://forms-api.test/api/database-cleanup/jobs/job-1',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: expect.stringMatching(/^Bearer /) }),
      }),
    );
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      'https://forms-api.test/api/database-cleanup/jobs/active',
      expect.objectContaining({ method: 'GET', headers: expect.objectContaining({ Authorization: 'Bearer token' }) }),
    );
    expect(fetch).toHaveBeenNthCalledWith(
      3,
      'https://forms-api.test/v1/forms?select=path&includeDeleted=true',
      expect.objectContaining({ method: 'GET', headers: expect.objectContaining({ Authorization: 'Bearer token' }) }),
    );
  });

  it('preserves not-found when there is no active job', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ message: 'No active job' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    await expect(service.getActiveJob('token')).rejects.toMatchObject({ errorCode: 'NOT_FOUND' });
  });

  it('maps upstream conflicts to semantic errors', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ message: 'A job is already running', errorCode: 'CONFLICT' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    await expect(service.start(startRequest, 'token')).rejects.toMatchObject({ errorCode: 'CONFLICT' });
  });
});
