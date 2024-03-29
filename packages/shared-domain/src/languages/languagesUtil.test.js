import { flattenGlobalI18nGroupedByTag, globalEntitiesToI18nGroupedByTag } from './languagesUtil';
import globalTranslationsEn from './testdata/global-translations-en';
import globalTranslationsNnNO from './testdata/global-translations-nn-NO';
import globalGrensesnittEn from './testdata/language-globalGrensesnitt-en';
import globalGrensesnittNnNO from './testdata/language-globalGrensesnitt-nn-NO';
import globalValideringEn from './testdata/language-globalValidering-en';
import globalValideringNnNO from './testdata/language-globalValidering-nn-NO';

describe('languagesUtil', () => {
  describe('globalEntitiesToI18nGroupedByTag', () => {
    it('converts global entities and groups by tag', () => {
      const i18n = globalEntitiesToI18nGroupedByTag([
        globalGrensesnittEn,
        globalValideringEn,
        globalGrensesnittNnNO,
        globalValideringNnNO,
      ]);
      expect(Object.keys(i18n)).toEqual(['en', 'nn-NO']);

      expect(i18n['en']).toHaveLength(2);
      expect(i18n['en'].map((t) => t.tag)).toEqual(['grensesnitt', 'validering']);

      expect(i18n['nn-NO']).toHaveLength(2);
      expect(i18n['nn-NO'].map((t) => t.tag)).toEqual(['grensesnitt', 'validering']);
    });
  });

  describe('flattenGlobalI18nGroupedByTag', () => {
    it('flattens', () => {
      const i18nGroupedByTag = {
        ...globalTranslationsEn,
        ...globalTranslationsNnNO,
      };
      const i18n = flattenGlobalI18nGroupedByTag(i18nGroupedByTag);
      expect(Object.keys(i18n)).toEqual(['en', 'nn-NO']);

      expect(i18n['en']['Oppsummering']).toBe('Summary');
      expect(i18n['en']['Forrige']).toBe('Previous');
      expect(i18n['en']['Dette er ikke et gyldig {{field}}.']).toBe('This is not a valid {{field}}.');

      expect(i18n['nn-NO']['Oppsummering']).toBe('Oppsummering');
      expect(i18n['nn-NO']['Forrige']).toBe('Førre');
      expect(i18n['nn-NO']['Dette er ikke et gyldig {{field}}.']).toBe('Dette er ikkje eit gyldig {{field}}.');
    });
  });
});
