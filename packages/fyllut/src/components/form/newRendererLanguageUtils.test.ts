import { Form, FormsApiTranslationMap } from '@navikt/skjemadigitalisering-shared-domain';
import { getAvailableLanguages, getCurrentLanguage, resolveActiveLanguage } from './newRendererLanguageUtils';

const form = {
  path: 'test',
  title: 'Test',
  skjemanummer: 'TEST',
  components: [],
  properties: {
    skjemanummer: 'TEST',
    tema: 'GEN',
    submissionTypes: [],
    subsequentSubmissionTypes: [],
    publishedLanguages: ['nb', 'nn'],
  },
} as Form;

describe('new renderer language utils', () => {
  it('uses published form languages and always includes bokmål', () => {
    expect(getAvailableLanguages(form, {})).toEqual(['nb', 'nn']);
  });

  it('falls back to languages represented in translations when publication metadata is absent', () => {
    const translations: FormsApiTranslationMap = {
      title: { nb: 'Tittel', en: 'Title' },
    };
    expect(
      getAvailableLanguages(
        {
          ...form,
          properties: { ...form.properties, publishedLanguages: undefined },
        },
        translations,
      ),
    ).toEqual(['nb', 'en']);
  });

  it('normalizes supported URL languages and rejects unavailable languages', () => {
    expect(getCurrentLanguage('?lang=nn-NO', ['nb', 'nn'])).toBe('nn');
    expect(getCurrentLanguage('?lang=en', ['nb', 'nn'])).toBe('nb');
    expect(getCurrentLanguage('?lang=unknown', ['nb', 'nn'])).toBe('nb');
  });

  describe('resolveActiveLanguage', () => {
    const availableLanguages = ['nb', 'nn', 'en'] as const;

    it('lets the URL lang param win over the draft language so the selector and deep links take effect', () => {
      expect(resolveActiveLanguage('?lang=en', [...availableLanguages], 'nb')).toBe('en');
      expect(resolveActiveLanguage('?lang=nb', [...availableLanguages], 'en')).toBe('nb');
    });

    it('seeds from the draft language only when no lang param is present', () => {
      expect(resolveActiveLanguage('', [...availableLanguages], 'en')).toBe('en');
      expect(resolveActiveLanguage('?innsendingsId=abc', [...availableLanguages], 'nn')).toBe('nn');
    });

    it('falls back to bokmål when there is no lang param and no usable draft language', () => {
      expect(resolveActiveLanguage('', [...availableLanguages], undefined)).toBe('nb');
      expect(resolveActiveLanguage('', ['nb', 'nn'], 'en')).toBe('nb');
    });
  });
});
