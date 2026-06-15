import { afterEach, describe, expect, it, vi } from 'vitest';
import { HttpResponseError } from '../../shared/http/http';
import prefillClient from './prefillClient';

describe('prefillClient', () => {
  const accessToken = 'tokenx-access-token';
  const baseUrl = 'https://send-inn.test/fyllUt/v1/prefill-data';

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('gets prefill data with properties query and authorization header', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ sokerFornavn: 'Ada' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const response = await prefillClient.getPrefillData({
      accessToken,
      baseUrl,
      properties: 'sokerFornavn,sokerEtternavn',
    });

    expect(response).toEqual({ sokerFornavn: 'Ada' });
    expect(global.fetch).toHaveBeenCalledWith(
      `${baseUrl}?properties=sokerFornavn%2CsokerEtternavn`,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: `Bearer ${accessToken}`,
          'x-correlation-id': expect.any(String),
        }),
      }),
    );
  });

  it('omits properties query when not provided', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ sokerFornavn: 'Ada' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await prefillClient.getPrefillData({
      accessToken,
      baseUrl,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      baseUrl,
      expect.objectContaining({
        method: 'GET',
      }),
    );
  });

  it('throws HttpResponseError when upstream request fails', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ message: 'Upstream failed' }), {
        status: 404,
        statusText: 'Not Found',
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(
      prefillClient.getPrefillData({
        accessToken,
        baseUrl,
      }),
    ).rejects.toBeInstanceOf(HttpResponseError);
  });
});
