import { Enhet, supportedEnhetstyper } from '@navikt/skjemadigitalisering-shared-domain';
import type { MockInstance } from 'vitest';
import { createNavUnitService } from './navUnitService';
import enheter from './testdata/enheter';

describe('createNavUnitService', () => {
  const baseUrl = 'http://norg2.test';
  const consumerId = 'test-client';
  const navUnits = [{ enhetId: 1, navn: 'Oslo', enhetNr: '0101', type: 'LOKAL' }] as Enhet[];

  const createService = () =>
    createNavUnitService({
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

  const expectGetRequest = (fetchSpy: MockInstance<typeof fetch>) => {
    expect(fetchSpy).toHaveBeenCalledWith(
      `${baseUrl}/norg2/api/v1/enhet?enhetStatusListe=AKTIV`,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          consumerId,
        }),
      }),
    );
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('gets nav units through the client endpoint', async () => {
    const fetchSpy = mockFetchResponse(JSON.stringify(navUnits), 200, 'application/json');
    const service = createService();

    await expect(service.getNavUnits()).resolves.toEqual(navUnits);
    expectGetRequest(fetchSpy);
  });

  it('maps json error responses from the client endpoint', async () => {
    mockFetchResponse(
      JSON.stringify({ message: 'norg2 unavailable', correlationId: 'corr-1' }),
      503,
      'application/json',
    );
    const service = createService();

    await expect(service.getNavUnits()).rejects.toMatchObject({
      errorCode: 'SERVICE_UNAVAILABLE',
      message: 'norg2 unavailable',
      correlationId: 'corr-1',
    });
  });

  describe('getSupportedNavUnits', () => {
    const createServiceWithUnits = (units: Enhet[]) =>
      createNavUnitService({ baseUrl, consumerId, client: { getNavUnits: vi.fn().mockResolvedValue(units) } });

    it('test data includes unsupported nav units', () => {
      expect(enheter.some((enhet) => !supportedEnhetstyper.includes(enhet.type))).toBe(true);
      expect(enheter.some((enhet) => enhet.enhetNr === '0000')).toBe(true);
    });

    it('filters nav units with unsupported type or enhetNr 0000', async () => {
      const navUnits = await createServiceWithUnits(enheter).getSupportedNavUnits();

      expect(navUnits.length).toBeGreaterThan(0);
      navUnits.forEach((enhet) => {
        expect(supportedEnhetstyper.includes(enhet.type)).toBe(true);
        expect(enhet.enhetNr).not.toBe('0000');
      });
    });

    it('only returns relevant data', async () => {
      const navUnits = await createServiceWithUnits(enheter).getSupportedNavUnits();

      expect(navUnits.length).toBeGreaterThan(0);
      navUnits.forEach((enhet) => {
        expect(Object.keys(enhet)).toEqual(['enhetId', 'navn', 'enhetNr', 'type']);
      });
    });
  });
});
