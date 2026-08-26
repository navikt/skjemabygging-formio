import { Form, FormsApiTranslationMap } from '@navikt/skjemadigitalisering-shared-domain';
import { getAvailableLanguages, getCurrentLanguage } from './newRendererLanguageUtils';

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
});
