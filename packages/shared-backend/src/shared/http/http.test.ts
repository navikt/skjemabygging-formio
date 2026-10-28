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

  it('propagates an abort while reading the response body', async () => {
    const controller = new AbortController();
    const timeoutError = new DOMException('Request timed out', 'TimeoutError');
    const body = new ReadableStream({
      start: (streamController) => {
        controller.signal.addEventListener('abort', () => streamController.error(controller.signal.reason));
      },
    });
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(body, { headers: { 'Content-Type': 'application/json' } }),
    );

    const request = http.get('https://example.test/translations', { signal: controller.signal });
    // Let fetch resolve so the abort happens while the body is being read.
    await Promise.resolve();
    controller.abort(timeoutError);

    await expect(request).rejects.toBe(timeoutError);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.test/translations',
      expect.objectContaining({ signal: controller.signal }),
    );
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

  it('preserves upstream merge errors without merge-specific mapping or logging raw bodies', async () => {
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
      message: errorBody.message,
      correlationId: 'upstream-correlation-id',
      body: errorBody,
      userMessage: undefined,
    });
    expect(warn).toHaveBeenCalledWith('Http request failed', {
      service: 'innsending-api.team-soknad',
      endpoint: '/fyllUt/v1/merge-filer',
      upstream_status: 500,
      error_code: 'INTERNAL_SERVER_ERROR',
      upstream_error_code: 'somethingFailedTryLater',
      upstream_correlation_id: 'upstream-correlation-id',
    });
    expect(JSON.stringify(warn.mock.calls)).not.toContain('private-');
  });

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
      upstream_error_code: undefined,
      upstream_correlation_id: 'upstream-correlation-id',
    });
    expect(JSON.stringify(warn.mock.calls)).not.toContain('private-upstream-details');
  });

  it.each([null, 42, { details: 'private-upstream-details' }])(
    'omits a non-string upstream error code (%j) without changing error mapping',
    async (errorCode) => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ errorCode, message: 'Service unavailable' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
      const warn = vi.spyOn(logger, 'warn').mockReturnValue(logger);

      await expect(http.get('http://example.test/resource')).rejects.toMatchObject({
        errorCode: 'SERVICE_UNAVAILABLE',
        message: 'Service unavailable',
      });
      expect(warn).toHaveBeenCalledWith('Http request failed', {
        service: 'example.test',
        endpoint: '/resource',
        upstream_status: 503,
        error_code: 'SERVICE_UNAVAILABLE',
        upstream_error_code: undefined,
        upstream_correlation_id: undefined,
      });
      expect(JSON.stringify(warn.mock.calls)).not.toContain('private-upstream-details');
    },
  );
});
