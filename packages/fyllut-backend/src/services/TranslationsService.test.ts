import { HttpResponseError, translationClient } from '@navikt/skjemadigitalisering-shared-backend';
import { FormsApiTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import path from 'path';
import { FyllutBackendConfig } from '../config/types';
import TranslationsService from './TranslationsService';

vi.mock('@navikt/skjemadigitalisering-shared-backend', async () => {
  const actual = await vi.importActual<typeof import('@navikt/skjemadigitalisering-shared-backend')>(
    '@navikt/skjemadigitalisering-shared-backend',
  );

  return {
    ...actual,
    translationClient: {
      getFormTranslations: vi.fn(),
      getGlobalTranslations: vi.fn(),
    },
  };
});

const testConfig: FyllutBackendConfig = {
  translationDir: path.join(__dirname + '/testdata/translations'),
  resourcesDir: path.join(__dirname + '/testdata/resources'),
} as FyllutBackendConfig;

describe('TranslationService', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getTranslationsForLanguage', () => {
    it('loads english translations', async () => {
      const translationsService = new TranslationsService(testConfig);
      const translationsForLanguage = await translationsService.getTranslationsForLanguage('nav123456', 'en');
      expect(translationsForLanguage).toEqual({
        April: 'April',
        August: 'August',
        Avbryt: 'Cancel',
        Avslutt: 'Exit',
        'Bor du i Norge?': 'Do you live in Norway?',
        'E-post': 'E-mail',
        'Laster...': 'Loading...',
        'Legg ved': 'Attach',
        Oppsummering: 'Summary',
        Organisasjonsnummer: 'Organisation number',
        Personopplysninger: 'Personal information',
        Postboks: 'PO box',
        Postboksadresse: 'PO box address',
        Postkode: 'Zip code',
        Postnummer: 'Zip code',
        Poststed: 'City',
        Region: 'Region',
        Telefonnummer: 'Telephone number',
        '{{count}} valg tilgjengelig': '{{count}} options available',
        'Jeg skal sende inn vedlegget': 'I will submit the attachment',
      });
    });

    it('loads nynorsk translations', async () => {
      const translationsService = new TranslationsService(testConfig);
      const translationsForLanguage = await translationsService.getTranslationsForLanguage('nav123456', 'nn');
      expect(translationsForLanguage).toEqual({
        'Jeg skal sende inn vedlegget': 'Eg skal sende inn vedlegget',
      });
    });

    it('loads empty transdlations when form has no translations', async () => {
      const translationsService = new TranslationsService(testConfig);
      const translationsForLanguage = await translationsService.getTranslationsForLanguage('nav123457', 'nn');
      expect(translationsForLanguage).toEqual({});
    });

    it('fails when formPath is invalid', async () => {
      const translationsService = new TranslationsService(testConfig);
      await expect(translationsService.getTranslationsForLanguage('&$%', 'nn')).rejects.toThrow(
        'Invalid formPath: &$%',
      );
    });

    describe('useFormsApiStaging branch', () => {
      const stagingConfig = {
        ...testConfig,
        useFormsApiStaging: true,
        formsApiUrl: 'http://forms-api',
      } as FyllutBackendConfig;

      it('maps FormsApiTranslation[] to I18nTranslations and skips globalTranslationId rows', async () => {
        vi.mocked(translationClient.getFormTranslations).mockResolvedValueOnce([
          { key: 'hello', nb: 'hei', nn: 'hei', en: 'hello' },
          { key: 'global-only', nb: 'globalt', globalTranslationId: 42 } as FormsApiTranslation,
        ]);

        const service = new TranslationsService(stagingConfig);
        const result = await service.loadTranslation('nav123456');

        expect(result).toEqual({
          'nb-NO': { hello: 'hei' },
          'nn-NO': { hello: 'hei' },
          en: { hello: 'hello' },
        });
      });

      it('returns {} when upstream throws HttpResponseError', async () => {
        vi.mocked(translationClient.getFormTranslations).mockRejectedValueOnce(
          new HttpResponseError('INTERNAL_SERVER_ERROR', 'boom', {}),
        );

        const service = new TranslationsService(stagingConfig);

        await expect(service.loadTranslation('nav123456')).resolves.toEqual({});
      });
    });
  });
});
