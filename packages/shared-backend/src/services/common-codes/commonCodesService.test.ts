import { createCommonCodesService } from './commonCodesService';

describe('commonCodesService', () => {
  it('maps archive subjects and falls back to code when term is missing', async () => {
    const client = {
      getCodeDescriptions: vi.fn().mockResolvedValueOnce({
        betydninger: {
          BIL: [{ beskrivelser: { nb: { term: 'Bil' } } }],
          TOM: [{}],
        },
      }),
    };

    const service = createCommonCodesService({
      baseUrl: 'http://kodeverk.test',
      consumerId: 'test-client',
      client,
    });

    await expect(service.getArchiveSubjects({ languageCode: 'nb' })).resolves.toEqual({
      BIL: 'Bil',
      TOM: 'TOM',
    });
  });

  it('sorts currencies with NOK EUR and SEK first', async () => {
    const client = {
      getCodeDescriptions: vi.fn().mockResolvedValueOnce({
        betydninger: {
          USD: [{ beskrivelser: { nb: { term: 'Dollar' } } }],
          NOK: [{ beskrivelser: { nb: { term: 'Norske kroner' } } }],
          SEK: [{ beskrivelser: { nb: { term: 'Svenske kroner' } } }],
          EUR: [{ beskrivelser: { nb: { term: 'Euro' } } }],
        },
      }),
    };

    const service = createCommonCodesService({
      baseUrl: 'http://kodeverk.test',
      consumerId: 'test-client',
      client,
    });

    await expect(service.getCurrencies()).resolves.toEqual([
      { label: 'Euro (EUR)', value: 'EUR' },
      { label: 'Norske kroner (NOK)', value: 'NOK' },
      { label: 'Svenske kroner (SEK)', value: 'SEK' },
      { label: 'Dollar (USD)', value: 'USD' },
    ]);
  });

  it('maps nav unit types using provided language', async () => {
    const client = {
      getCodeDescriptions: vi.fn().mockResolvedValueOnce({
        betydninger: {
          LOKAL: [{ beskrivelser: { en: { term: 'Local' } } }],
          KO: [{}],
        },
      }),
    };

    const service = createCommonCodesService({
      baseUrl: 'http://kodeverk.test',
      consumerId: 'test-client',
      client,
    });

    await expect(service.getNavUnitTypes({ languageCode: 'en' })).resolves.toEqual([
      { kodenavn: 'LOKAL', term: 'Local' },
      { kodenavn: 'KO', term: 'KO' },
    ]);
    expect(client.getCodeDescriptions).toHaveBeenCalledWith(
      expect.objectContaining({
        commonCode: 'EnhetstyperNorg',
        languageCode: 'en',
      }),
    );
  });

  it('sorts area codes by label', async () => {
    const client = {
      getCodeDescriptions: vi.fn().mockResolvedValueOnce({
        betydninger: {
          '47': [{ beskrivelser: { nb: { term: 'Norge' } } }],
          '46': [{ beskrivelser: { nb: { term: 'Sverige' } } }],
        },
      }),
    };

    const service = createCommonCodesService({
      baseUrl: 'http://kodeverk.test',
      consumerId: 'test-client',
      client,
    });

    await expect(service.getAreaCodes()).resolves.toEqual([
      { label: '46 Sverige', value: '46' },
      { label: '47 Norge', value: '47' },
    ]);
  });
});
