import { afterEach, describe, expect, it, vi } from 'vitest';
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
});
