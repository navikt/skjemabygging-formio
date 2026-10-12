import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { logger } from '../../shared/logger/logger';
import mergeFileClient from './mergeFileClient';

const props = {
  baseUrl: 'http://innsending-api.team-soknad',
  accessToken: 'test-token',
  body: {
    tittel: 'Application',
    spraak: 'en',
    filer: ['base64-document'],
  },
};
const targetUrl = `${props.baseUrl}/fyllUt/v1/merge-filer`;

describe('mergeFileClient', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('preserves binary PDF responses even when the content type is incorrect', async () => {
    const pdf = Buffer.from('%PDF-1.7\nsample');
    const response = new Response(pdf, { headers: { 'Content-Type': 'application/json' } });
    Object.defineProperty(response, 'url', { value: targetUrl });
    const fetch = vi.spyOn(global, 'fetch').mockResolvedValue(response);

    await expect(mergeFileClient.mergeFiles(props)).resolves.toBe(pdf.toString('base64'));
    expect(fetch).toHaveBeenCalledWith(
      targetUrl,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(props.body),
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
      }),
    );
  });

  it('reports invalid base64 padding without retaining or logging private upstream details', async () => {
    const errorBody = {
      message:
        'JSON parse error: Cannot deserialize value of type `byte[]` from String "private-document": ' +
        "Unexpected end of base64-encoded String: base64 variant 'MIME-NO-LINEFEEDS' expects padding",
      correlationId: 'upstream-correlation-id',
      document: 'private-document',
    };
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(errorBody), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'x-correlation-id': 'header-correlation-id' },
      }),
    );
    const warn = vi.spyOn(logger, 'warn').mockReturnValue(logger);
    const error = await mergeFileClient.mergeFiles(props).catch((error: unknown) => error);

    expect(error).toBeInstanceOf(ResponseError);
    expect(error).toMatchObject({
      errorCode: 'INTERNAL_SERVER_ERROR',
      message: 'PDF merge failed: invalid base64 padding',
      correlationId: 'upstream-correlation-id',
      userMessage: undefined,
    });
    expect(error).not.toHaveProperty('body');
    expect(String(error)).not.toContain('private-');
    expect(JSON.stringify(error)).not.toContain('private-');
    expect(warn).toHaveBeenCalledWith(
      'Http request failed',
      expect.objectContaining({
        upstream_status: 500,
        reason: 'INTERNAL_SERVER_ERROR',
        upstream_correlation_id: 'upstream-correlation-id',
      }),
    );
    expect(JSON.stringify(warn.mock.calls)).not.toContain('private-');
  });

  it.each(['application/json', 'text/plain', 'text/html'])(
    'sanitizes %s merge failures while preserving the error code and header correlation ID',
    async (contentType) => {
      const errorBody =
        contentType === 'application/json'
          ? JSON.stringify({ message: 'private-upstream-details' })
          : 'private-upstream-details';
      vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response(errorBody, {
          status: 503,
          headers: { 'Content-Type': contentType, 'x-correlation-id': 'header-correlation-id' },
        }),
      );
      const warn = vi.spyOn(logger, 'warn').mockReturnValue(logger);
      const error = await mergeFileClient.mergeFiles(props).catch((error: unknown) => error);

      expect(error).toBeInstanceOf(ResponseError);
      expect(error).toMatchObject({
        errorCode: 'SERVICE_UNAVAILABLE',
        message: 'PDF merge request failed',
        correlationId: 'header-correlation-id',
      });
      expect(error).not.toHaveProperty('body');
      expect(String(error)).not.toContain('private-');
      expect(JSON.stringify(error)).not.toContain('private-');
      expect(JSON.stringify(warn.mock.calls)).not.toContain('private-');
    },
  );

  it('reports an empty merged PDF as not found', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(new Response('', { headers: { 'Content-Type': 'application/pdf' } }));

    await expect(mergeFileClient.mergeFiles(props)).rejects.toMatchObject({
      errorCode: 'NOT_FOUND',
      message: 'Could not find merged file',
    });
  });

  it('rethrows network errors unchanged', async () => {
    const error = new TypeError('fetch failed');
    vi.spyOn(global, 'fetch').mockRejectedValue(error);

    await expect(mergeFileClient.mergeFiles(props)).rejects.toBe(error);
  });
});
