import { afterEach, describe, expect, it, vi } from 'vitest';
import http, { HttpResponseError } from './http';

describe('http', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('preserves upstream correlation id on error responses', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ message: 'not found' }), {
        status: 404,
        statusText: 'Not Found',
        headers: {
          'Content-Type': 'application/json',
          'x-correlation-id': 'corr-123',
        },
      }),
    );

    await expect(http.get('https://example.test/error')).rejects.toEqual(
      expect.objectContaining({
        correlationId: 'corr-123',
      }),
    );
  });

  it('throws HttpResponseError on non-2xx responses', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ message: 'not found' }), {
        status: 404,
        statusText: 'Not Found',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );

    await expect(http.get('https://example.test/error')).rejects.toBeInstanceOf(HttpResponseError);
  });
});
