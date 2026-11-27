import { afterEach, describe, expect, it, vi } from 'vitest';
import { logger } from '../logger/logger';
import http from './http';

const createSocketFetchError = (code: string, message = 'other side closed') =>
  new TypeError('fetch failed', {
    cause: Object.assign(new Error(message), { code }),
  });

describe('http', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(['get', 'post', 'put', 'delete', 'postMultipart'] as const)(
    'suppresses transport logs for %s without changing error propagation',
    async (method) => {
      const debugSpy = vi.spyOn(logger, 'debug');
      const warnSpy = vi.spyOn(logger, 'warn');
      const errorBody = { message: 'private-response', correlationId: 'upstream-correlation-id' };
      vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response(JSON.stringify(errorBody), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
      const url = 'https://example.test/private-path';
      const options = { suppressTransportLogs: true };
      const request =
        method === 'get'
          ? http.get(url, options)
          : method === 'postMultipart'
            ? http.postMultipart(url, new FormData(), options)
            : method === 'put'
              ? http.put(url, undefined, options)
              : http[method](url, undefined, options);

      await expect(request).rejects.toMatchObject({
        errorCode: 'SERVICE_UNAVAILABLE',
        message: errorBody.message,
        correlationId: errorBody.correlationId,
        body: errorBody,
      });
      expect(debugSpy).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
    },
  );

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

  it.each(['UND_ERR_SOCKET', 'ECONNRESET'] as const)(
    'retries GET once on %s and logs a safe warning',
    async (errorCode) => {
      const fetchSpy = vi
        .spyOn(global, 'fetch')
        .mockRejectedValueOnce(createSocketFetchError(errorCode))
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        );
      const warn = vi.spyOn(logger, 'warn').mockReturnValue(logger);

      const response = await http.get<{ ok: boolean }>('https://kodeverk.test/api/currencies?secret=private-query', {
        accessToken: 'private-token',
      });

      expect(response).toEqual({ ok: true });
      expect(fetchSpy).toHaveBeenCalledTimes(2);
      expect(fetchSpy.mock.calls[1]).toEqual(fetchSpy.mock.calls[0]);
      expect(warn).toHaveBeenCalledExactlyOnceWith('Retrying http request after socket error', {
        method: 'GET',
        service: 'kodeverk.test',
        endpoint: '/api/currencies',
        error_code: errorCode,
      });
      expect(JSON.stringify(warn.mock.calls)).not.toContain('private-');
    },
  );

  it('retries at most once when the retry also fails with UND_ERR_SOCKET', async () => {
    const firstError = createSocketFetchError('UND_ERR_SOCKET');
    const secondError = createSocketFetchError('UND_ERR_SOCKET');
    const fetchSpy = vi.spyOn(global, 'fetch').mockRejectedValueOnce(firstError).mockRejectedValueOnce(secondError);
    const warn = vi.spyOn(logger, 'warn').mockReturnValue(logger);

    await expect(http.get('https://kodeverk.test/api/currencies')).rejects.toBe(secondError);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('does not retry GET when the AbortSignal is aborted', async () => {
    const controller = new AbortController();
    const socketError = createSocketFetchError('UND_ERR_SOCKET');
    const fetchSpy = vi.spyOn(global, 'fetch').mockImplementationOnce(async () => {
      controller.abort(new DOMException('Request timed out', 'TimeoutError'));
      throw socketError;
    });
    const warn = vi.spyOn(logger, 'warn').mockReturnValue(logger);

    await expect(http.get('https://kodeverk.test/api/currencies', { signal: controller.signal })).rejects.toBe(
      socketError,
    );
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(warn).not.toHaveBeenCalled();
  });

  it.each([
    ['TypeError without cause', new TypeError('fetch failed')],
    ['TypeError with ECONNREFUSED', createSocketFetchError('ECONNREFUSED', 'connect ECONNREFUSED')],
    ['non-TypeError with UND_ERR_SOCKET', new Error('fetch failed', { cause: { code: 'UND_ERR_SOCKET' } })],
  ])('does not retry GET on %s', async (_label, error) => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockRejectedValueOnce(error);
    const warn = vi.spyOn(logger, 'warn').mockReturnValue(logger);

    await expect(http.get('https://kodeverk.test/api/currencies')).rejects.toBe(error);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(warn).not.toHaveBeenCalled();
  });

  it.each(['UND_ERR_SOCKET', 'ECONNRESET'] as const)(
    'retries PUT once on %s when retryOnSocketError is enabled and omits payloads from logs',
    async (errorCode) => {
      const fetchSpy = vi
        .spyOn(global, 'fetch')
        .mockRejectedValueOnce(createSocketFetchError(errorCode))
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ saved: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        );
      const warn = vi.spyOn(logger, 'warn').mockReturnValue(logger);

      const response = await http.put<{ saved: boolean }>(
        'https://send-inn.test/fyllUt/v1/soknad/123?secret=private-query',
        { answer: 'private-payload' },
        {
          accessToken: 'private-token',
          retryOnSocketError: true,
          suppressTransportLogs: true,
        },
      );

      expect(response).toEqual({ saved: true });
      expect(fetchSpy).toHaveBeenCalledTimes(2);
      expect(fetchSpy.mock.calls[1]).toEqual(fetchSpy.mock.calls[0]);
      expect(warn).toHaveBeenCalledExactlyOnceWith('Retrying http request after socket error', {
        method: 'PUT',
        service: 'send-inn.test',
        endpoint: '/fyllUt/v1/soknad/123',
        error_code: errorCode,
      });
      expect(JSON.stringify(warn.mock.calls)).not.toContain('private-');
    },
  );

  it('does not retry PUT when retryOnSocketError is not enabled', async () => {
    const socketError = createSocketFetchError('UND_ERR_SOCKET');
    const fetchSpy = vi.spyOn(global, 'fetch').mockRejectedValueOnce(socketError);
    const warn = vi.spyOn(logger, 'warn').mockReturnValue(logger);

    await expect(http.put('https://send-inn.test/fyllUt/v1/utfyltSoknad/123', { data: true })).rejects.toBe(
      socketError,
    );
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(warn).not.toHaveBeenCalled();
  });

  it.each(['post', 'postMultipart', 'delete'] as const)('does not retry %s on UND_ERR_SOCKET', async (method) => {
    const socketError = createSocketFetchError('UND_ERR_SOCKET');
    const fetchSpy = vi.spyOn(global, 'fetch').mockRejectedValueOnce(socketError);
    const warn = vi.spyOn(logger, 'warn').mockReturnValue(logger);

    const request =
      method === 'postMultipart'
        ? http.postMultipart('https://send-inn.test/upload', new FormData())
        : http[method]('https://send-inn.test/resource', { data: true });

    await expect(request).rejects.toBe(socketError);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(warn).not.toHaveBeenCalled();
  });

  it.each([400, 404, 429, 500, 502, 503, 504, 599])(
    'does not retry GET or retryable PUT on HTTP %i error status',
    async (status) => {
      const fetchSpy = vi
        .spyOn(global, 'fetch')
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ message: `HTTP ${status}` }), {
            status,
            headers: { 'Content-Type': 'application/json' },
          }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ message: `HTTP ${status}` }), {
            status,
            headers: { 'Content-Type': 'application/json' },
          }),
        );

      await expect(http.get('https://example.test/resource')).rejects.toMatchObject({
        message: `HTTP ${status}`,
      });
      await expect(
        http.put('https://example.test/resource', { data: true }, { retryOnSocketError: true }),
      ).rejects.toMatchObject({
        message: `HTTP ${status}`,
      });
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    },
  );
});
