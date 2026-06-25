import { afterEach, describe, expect, it, vi } from 'vitest';
import { createPrefillService } from './prefillService';

describe('createPrefillService', () => {
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

    const service = createPrefillService({ baseUrl });

    const response = await service.getPrefillData({
      accessToken,
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

    const service = createPrefillService({ baseUrl });

    await service.getPrefillData({
      accessToken,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      baseUrl,
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
      }),
    ).rejects.toMatchObject({
      errorCode: 'NOT_FOUND',
      correlationId: 'corr-123',
      message: 'Feil ved kall til SendInn for preutfylling',
      userMessage: 'Feil ved kall til SendInn for preutfylling',
    });
  });
});
