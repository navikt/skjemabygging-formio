import { afterEach, describe, expect, it, vi } from 'vitest';
import { createPrefillService } from './prefillService';

describe('createPrefillService', () => {
  const accessToken = 'tokenx-access-token';
  const baseUrl = 'https://send-inn.test';
  const prefillDataPath = '/fyllUt/v1/prefill-data';
  const nationalIdentityNumber = '12345678911';

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

    const service = createPrefillService({ baseUrl });

    const response = await service.getPrefillData({
      accessToken,
      properties: 'sokerFornavn,sokerEtternavn',
      nationalIdentityNumber,
    });

    expect(response).toEqual({ sokerFornavn: 'Ada' });
    expect(global.fetch).toHaveBeenCalledWith(
      `${baseUrl}${prefillDataPath}?properties=sokerFornavn%2CsokerEtternavn`,
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

    const service = createPrefillService({ baseUrl });

    await service.getPrefillData({
      accessToken,
      nationalIdentityNumber,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `${baseUrl}${prefillDataPath}`,
      expect.objectContaining({
        method: 'GET',
      }),
    );
  });

  it('wraps ResponseError with prefill-specific message', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ message: 'Upstream failed' }), {
        status: 404,
        statusText: 'Not Found',
        headers: {
          'Content-Type': 'application/json',
          'x-correlation-id': 'corr-123',
        },
      }),
    );

    const service = createPrefillService({ baseUrl });

    await expect(
      service.getPrefillData({
        accessToken,
        properties: 'sokerIdentifikasjonsnummer',
        nationalIdentityNumber,
      }),
    ).rejects.toMatchObject({
      errorCode: 'NOT_FOUND',
      correlationId: 'corr-123',
      message: 'Feil ved kall til SendInn for preutfylling',
      userMessage: 'Feil ved kall til SendInn for preutfylling',
    });
  });

  describe('when prefill data cannot be fetched', () => {
    it.each([500, 502, 503, 504])('falls back to the national identity number on status %i', async (status) => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ message: 'Upstream failed' }), {
          status,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const service = createPrefillService({ baseUrl });

      const response = await service.getPrefillData({
        accessToken,
        properties: 'sokerFornavn,sokerIdentifikasjonsnummer',
        nationalIdentityNumber,
      });

      expect(response).toEqual({ sokerIdentifikasjonsnummer: nationalIdentityNumber });
    });

    it('falls back to the national identity number on network errors', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValue(new TypeError('fetch failed'));

      const service = createPrefillService({ baseUrl });

      const response = await service.getPrefillData({
        accessToken,
        properties: 'sokerIdentifikasjonsnummer',
        nationalIdentityNumber,
      });

      expect(response).toEqual({ sokerIdentifikasjonsnummer: nationalIdentityNumber });
    });

    it('falls back to the national identity number when the request times out', async () => {
      vi.spyOn(AbortSignal, 'timeout').mockReturnValue(
        AbortSignal.abort(new DOMException('The operation timed out.', 'TimeoutError')),
      );
      vi.spyOn(global, 'fetch').mockImplementation(async (_url, init) => {
        init?.signal?.throwIfAborted();
        return new Response(JSON.stringify({ sokerFornavn: 'Ada' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      });

      const service = createPrefillService({ baseUrl });

      const response = await service.getPrefillData({
        accessToken,
        properties: 'sokerFornavn,sokerIdentifikasjonsnummer',
        nationalIdentityNumber,
      });

      expect(response).toEqual({ sokerIdentifikasjonsnummer: nationalIdentityNumber });
    });

    it('returns empty prefill data when the national identity number is not requested', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(new Response(null, { status: 500 }));

      const service = createPrefillService({ baseUrl });

      const response = await service.getPrefillData({
        accessToken,
        properties: 'sokerFornavn,sokerEtternavn',
        nationalIdentityNumber,
      });

      expect(response).toEqual({});
    });
  });
});
