import { normalizeLanguageCode, normalizeTranslations, resolveLanguageCode } from './languageUtils';

describe('languageUtils', () => {
  describe('normalizeLanguageCode', () => {
    it.each([
      ['nb-NO', 'nb'],
      ['nb', 'nb'],
      ['no', 'nb'],
      ['nn-NO', 'nn'],
      ['nn', 'nn'],
      ['en', 'en'],
    ])('normalizes %s to %s', (languageCode, expected) => {
      expect(normalizeLanguageCode(languageCode)).toBe(expected);
    });
  });

  describe('normalizeTranslations', () => {
    it('normalizes production locale keys and preserves all translations', () => {
      expect(
        normalizeTranslations({
          'nb-NO': { 'introPage.dataStorage.title.digital': 'Vi lagrer svar underveis' },
          'nn-NO': { 'introPage.dataStorage.title.digital': 'Me lagrar svar undervegs' },
          en: { 'introPage.dataStorage.title.digital': 'We save your answers' },
        }),
      ).toEqual({
        nb: { 'introPage.dataStorage.title.digital': 'Vi lagrer svar underveis' },
        nn: { 'introPage.dataStorage.title.digital': 'Me lagrar svar undervegs' },
        en: { 'introPage.dataStorage.title.digital': 'We save your answers' },
      });
    });
  });

  describe('resolveLanguageCode', () => {
    const translations = { nb: {}, nn: {}, en: {} };

    it('accepts both full locales and short language codes', () => {
      expect(resolveLanguageCode('nb-NO', translations)).toBe('nb');
      expect(resolveLanguageCode('nn', translations)).toBe('nn');
    });

    it('uses bokmal for an unsupported language', () => {
      expect(resolveLanguageCode('cn', translations)).toBe('nb');
    });
  });
});
