import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { afterEach, describe, expect, it, vi } from 'vitest';
import http from './http';

describe('shared http', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('preserves upstream response error details from json bodies', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            message: 'Internal upstream detail',
            userMessage: 'statiske.nologin.temporarilyUnavailable',
            errorCode: 'SERVICE_UNAVAILABLE',
            correlation_id: 'corr-id',
          }),
          {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      ),
    );

    await expect(http.get('https://www.nav.no/response-error')).rejects.toMatchObject({
      constructor: ResponseError,
      message: 'Internal upstream detail',
      userMessage: 'statiske.nologin.temporarilyUnavailable',
      errorCode: 'SERVICE_UNAVAILABLE',
      correlationId: 'corr-id',
    });
  });

  it('falls back to status-derived error code for plain-text failures', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('Plain upstream error', {
          status: 404,
          statusText: 'Not Found',
          headers: { 'Content-Type': 'text/plain' },
        }),
      ),
    );

    await expect(http.get('https://www.nav.no/error')).rejects.toMatchObject({
      constructor: ResponseError,
      message: 'Plain upstream error',
      errorCode: 'NOT_FOUND',
      correlationId: undefined,
      userMessage: undefined,
    });
  });
});
