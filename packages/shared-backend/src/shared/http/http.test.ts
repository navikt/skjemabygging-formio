import { afterEach, describe, expect, it, vi } from 'vitest';
import { logger } from '../logger/logger';
import http from './http';

describe('http', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns status and headers for manual redirect responses', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(null, {
        status: 302,
        headers: {
          Location: 'https://nav.no/next',
        },
      }),
    );

    const response = await http.put('https://example.test/resource', undefined, {
      redirect: 'manual',
      responseType: 'metadata',
    });

    expect(response).toEqual({
      status: 302,
      headers: {
        location: 'https://nav.no/next',
      },
      body: undefined,
    });
  });

  it('posts multipart form data without overriding content type', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );

    const formData = new FormData();
    formData.append('file', new Blob(['file-content'], { type: 'text/plain' }), 'test.txt');

    await http.postMultipart('https://example.test/upload', formData, {
      accessToken: 'token',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.test/upload',
      expect.objectContaining({
        method: 'POST',
        body: formData,
        headers: expect.not.objectContaining({
          'Content-Type': expect.anything(),
        }),
      }),
    );
  });

  it('returns stream response without consuming body', async () => {
    const stream = new ReadableStream<Uint8Array>({
      start: (controller) => {
        controller.enqueue(new Uint8Array([1, 2, 3]));
        controller.close();
      },
    });

    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(stream, {
        status: 200,
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Length': '3',
        },
      }),
    );

    const response = await http.get('https://example.test/download', {
      responseType: 'stream',
    });

    expect(response.status).toBe(200);
    expect(response.headers).toEqual({
      'content-length': '3',
      'content-type': 'application/octet-stream',
    });
    expect(response.body).toBeInstanceOf(ReadableStream);
  });

  it('preserves binary merge responses even when the content type is incorrect', async () => {
    const pdf = Buffer.from('%PDF-1.7\nsample');
    const response = new Response(pdf, {
      headers: { 'Content-Type': 'application/json' },
    });
    Object.defineProperty(response, 'url', {
      value: 'http://innsending-api.team-soknad/fyllUt/v1/merge-filer',
    });
    vi.spyOn(global, 'fetch').mockResolvedValue(response);

    await expect(http.post(response.url, { filer: [] })).resolves.toBe(pdf.toString('base64'));
  });

  it('reports invalid base64 padding without exposing the document or raw error body', async () => {
    const errorBody = {
      message:
        'JSON parse error: Cannot deserialize value of type `byte[]` from String "private-document": ' +
        "Unexpected end of base64-encoded String: base64 variant 'MIME-NO-LINEFEEDS' expects padding",
      errorCode: 'somethingFailedTryLater',
      correlationId: 'upstream-correlation-id',
      document: 'private-document',
    };
    const response = new Response(JSON.stringify(errorBody), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'x-correlation-id': 'header-correlation-id',
      },
    });
    Object.defineProperty(response, 'url', {
      value: 'http://innsending-api.team-soknad/fyllUt/v1/merge-filer?detail=private-value',
    });
    vi.spyOn(global, 'fetch').mockResolvedValue(response);
    const warn = vi.spyOn(logger, 'warn').mockReturnValue(logger);

    await expect(http.post(response.url, { filer: [] })).rejects.toMatchObject({
      errorCode: 'INTERNAL_SERVER_ERROR',
      message: 'PDF merge failed: invalid base64 padding',
      correlationId: 'upstream-correlation-id',
      body: errorBody,
      userMessage: undefined,
    });
    expect(warn).toHaveBeenCalledWith('Http request failed', {
      service: 'innsending-api.team-soknad',
      endpoint: '/fyllUt/v1/merge-filer',
      upstream_status: 500,
      error_code: 'INTERNAL_SERVER_ERROR',
      reason: 'PDF merge failed: invalid base64 padding',
      upstream_correlation_id: 'upstream-correlation-id',
    });
    expect(JSON.stringify(warn.mock.calls)).not.toContain('private-');
  });

  it.each(['application/json', 'text/plain', 'text/html'])(
    'handles %s merge errors without base64 encoding or exposing their contents',
    async (contentType) => {
      const errorBody =
        contentType === 'application/json'
          ? JSON.stringify({ message: 'private-upstream-details' })
          : 'private-upstream-details';
      const response = new Response(errorBody, {
        status: 503,
        headers: {
          'Content-Type': contentType,
          'x-correlation-id': 'header-correlation-id',
        },
      });
      Object.defineProperty(response, 'url', {
        value: 'http://innsending-api.team-soknad/fyllUt/v1/merge-filer',
      });
      vi.spyOn(global, 'fetch').mockResolvedValue(response);
      const warn = vi.spyOn(logger, 'warn').mockReturnValue(logger);

      await expect(http.post(response.url, { filer: [] })).rejects.toMatchObject({
        errorCode: 'SERVICE_UNAVAILABLE',
        message: 'PDF merge request failed',
        correlationId: 'header-correlation-id',
      });
      expect(warn).toHaveBeenCalledWith(
        'Http request failed',
        expect.objectContaining({
          upstream_status: 503,
          reason: 'PDF merge request failed',
          upstream_correlation_id: 'header-correlation-id',
        }),
      );
      expect(JSON.stringify(warn.mock.calls)).not.toContain('private-upstream-details');
    },
  );

  it('preserves non-merge errors without logging their raw bodies', async () => {
    const errorBody = {
      message: 'Service unavailable',
      correlation_id: 'upstream-correlation-id',
      details: 'private-upstream-details',
    };
    const response = new Response(JSON.stringify(errorBody), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
    vi.spyOn(global, 'fetch').mockResolvedValue(response);
    const warn = vi.spyOn(logger, 'warn').mockReturnValue(logger);

    await expect(http.get('http://example.test/resource')).rejects.toMatchObject({
      errorCode: 'SERVICE_UNAVAILABLE',
      message: 'Service unavailable',
      correlationId: 'upstream-correlation-id',
      body: errorBody,
    });
    expect(warn).toHaveBeenCalledWith('Http request failed', {
      service: 'example.test',
      endpoint: '/resource',
      upstream_status: 503,
      error_code: 'SERVICE_UNAVAILABLE',
      reason: 'SERVICE_UNAVAILABLE',
      upstream_correlation_id: 'upstream-correlation-id',
    });
    expect(JSON.stringify(warn.mock.calls)).not.toContain('private-upstream-details');
  });
});
