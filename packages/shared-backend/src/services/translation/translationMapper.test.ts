import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import { convertI18nTranslationsToFormsApiTranslationMap, convertToFormsApiTranslationMap } from './translationMapper';

const required = {
  nb: TEXTS.validering.required,
  nn: 'Du må fylle ut: {{field}}',
  en: 'You must fill in: {{field}}',
};

describe('translationMapper', () => {
  describe('convertI18nTranslationsToFormsApiTranslationMap', () => {
    it('stores validation translations under both their key and their Bokmål text', () => {
      const translations = convertI18nTranslationsToFormsApiTranslationMap({
        'nn-NO': { required: required.nn },
        en: { required: required.en, Ja: 'Yes' },
      });

      expect(translations.required).toEqual(required);
      expect(translations[TEXTS.validering.required]).toEqual(required);
      expect(translations.Ja).toEqual({ en: 'Yes' });
    });
  });

  describe('convertToFormsApiTranslationMap', () => {
    it('stores validation translations under both their key and their Bokmål text', () => {
      const translations = convertToFormsApiTranslationMap([
        { key: 'required', nn: required.nn, en: required.en },
        { key: 'Ja', nb: 'Ja', en: 'Yes' },
      ]);

      expect(translations.required).toEqual(required);
      expect(translations[TEXTS.validering.required]).toEqual(required);
      expect(translations.Ja).toEqual({ nb: 'Ja', en: 'Yes' });
    });
  });
});
