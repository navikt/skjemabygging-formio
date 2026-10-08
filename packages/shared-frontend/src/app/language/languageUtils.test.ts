import { getAvailableLanguages, getCurrentLanguage, resolveActiveLanguage } from './languageUtils';

describe('new renderer language utils', () => {
  it('uses the languages provided by the backend and always includes bokmål', () => {
    expect(getAvailableLanguages(['nn'])).toEqual(['nb', 'nn']);
    expect(getAvailableLanguages(['nb', 'nn', 'en'])).toEqual(['nb', 'nn', 'en']);
  });

  it('falls back to bokmål when the backend provides no languages', () => {
    expect(getAvailableLanguages(undefined)).toEqual(['nb']);
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
