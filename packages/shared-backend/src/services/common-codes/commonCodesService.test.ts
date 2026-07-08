import correlator from 'express-correlation-id';
import type { MockInstance } from 'vitest';
import { createCommonCodesService } from './commonCodesService';

vi.mock('express-correlation-id', () => ({
  default: {
    getId: vi.fn(),
  },
}));

describe('createCommonCodesService', () => {
  const baseUrl = 'http://kodeverk.test';
  const consumerId = 'test-client';

  const createService = () =>
    createCommonCodesService({
      baseUrl,
      consumerId,
    });

  const mockFetchResponse = (body: BodyInit, status: number, contentType: string) =>
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(body, {
        status,
        headers: {
          'Content-Type': contentType,
        },
      }),
    );

  const expectGetRequest = (
    fetchSpy: MockInstance<typeof fetch>,
    commonCode: string,
    languageCode: string,
    accessToken?: string,
  ) => {
    expect(fetchSpy).toHaveBeenCalledWith(
      `${baseUrl}/api/v1/kodeverk/${commonCode}/koder/betydninger?ekskluderUgyldige=true&spraak=${languageCode}`,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Nav-Call-Id': 'corr-id',
          'Nav-Consumer-Id': consumerId,
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        }),
      }),
    );
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('maps archive subjects and falls back to code when term is missing', async () => {
    vi.mocked(correlator.getId).mockReturnValue('corr-id');
    const fetchSpy = mockFetchResponse(
      JSON.stringify({
        betydninger: {
          BIL: [{ beskrivelser: { nb: { term: 'Bil' } } }],
          TOM: [{}],
        },
      }),
      200,
      'application/json',
    );
    const service = createService();

    await expect(service.getArchiveSubjects({ languageCode: 'nb', accessToken: 'azure-token' })).resolves.toEqual({
      BIL: 'Bil',
      TOM: 'TOM',
    });
    expectGetRequest(fetchSpy, 'TemaIFyllUt', 'nb', 'azure-token');
  });

  it('sorts currencies with NOK EUR and SEK first', async () => {
    vi.mocked(correlator.getId).mockReturnValue('corr-id');
    const fetchSpy = mockFetchResponse(
      JSON.stringify({
        betydninger: {
          USD: [{ beskrivelser: { nb: { term: 'Dollar' } } }],
          NOK: [{ beskrivelser: { nb: { term: 'Norske kroner' } } }],
          SEK: [{ beskrivelser: { nb: { term: 'Svenske kroner' } } }],
          EUR: [{ beskrivelser: { nb: { term: 'Euro' } } }],
        },
      }),
      200,
      'application/json',
    );
    const service = createService();

    await expect(service.getCurrencies()).resolves.toEqual([
      { label: 'Euro (EUR)', value: 'EUR' },
      { label: 'Norske kroner (NOK)', value: 'NOK' },
      { label: 'Svenske kroner (SEK)', value: 'SEK' },
      { label: 'Dollar (USD)', value: 'USD' },
    ]);
    expectGetRequest(fetchSpy, 'ValutaBetaling', 'nb');
  });

  it('maps nav unit types using provided language', async () => {
    vi.mocked(correlator.getId).mockReturnValue('corr-id');
    const fetchSpy = mockFetchResponse(
      JSON.stringify({
        betydninger: {
          LOKAL: [{ beskrivelser: { en: { term: 'Local' } } }],
          KO: [{}],
        },
      }),
      200,
      'application/json',
    );
    const service = createService();

    await expect(service.getNavUnitTypes({ languageCode: 'en' })).resolves.toEqual([
      { kodenavn: 'LOKAL', term: 'Local' },
      { kodenavn: 'KO', term: 'KO' },
    ]);
    expectGetRequest(fetchSpy, 'EnhetstyperNorg', 'en');
  });

  it('sorts area codes by label', async () => {
    vi.mocked(correlator.getId).mockReturnValue('corr-id');
    const fetchSpy = mockFetchResponse(
      JSON.stringify({
        betydninger: {
          '47': [{ beskrivelser: { nb: { term: 'Norge' } } }],
          '46': [{ beskrivelser: { nb: { term: 'Sverige' } } }],
        },
      }),
      200,
      'application/json',
    );
    const service = createService();

    await expect(service.getAreaCodes()).resolves.toEqual([
      { label: '46 Sverige', value: '46' },
      { label: '47 Norge', value: '47' },
    ]);
    expectGetRequest(fetchSpy, 'Retningsnumre', 'nb');
  });

  it('maps json error responses from the client endpoint', async () => {
    vi.mocked(correlator.getId).mockReturnValue('corr-id');
    mockFetchResponse(
      JSON.stringify({ message: 'kodeverk unavailable', correlationId: 'corr-1' }),
      503,
      'application/json',
    );
    const service = createService();

    await expect(service.getArchiveSubjects({ languageCode: 'nb' })).rejects.toMatchObject({
      errorCode: 'SERVICE_UNAVAILABLE',
      message: 'kodeverk unavailable',
      correlationId: 'corr-1',
    });
  });
});
