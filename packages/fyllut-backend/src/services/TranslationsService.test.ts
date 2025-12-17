import path from 'path';
import { ConfigType } from '../config/types';
import TranslationsService from './TranslationsService';

const testConfig: ConfigType = {
  translationDir: path.join(__dirname + '/testdata/translations'),
  resourcesDir: path.join(__dirname + '/testdata/resources'),
} as ConfigType;

describe('TranslationService', () => {
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
  });
});
