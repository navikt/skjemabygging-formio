import { localizationUtils, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';

const toLanguage = (languageCode: string): TranslationLang => localizationUtils.getLanguageCodeAsIso639_1(languageCode);

/**
 * The backend decides which languages a form offers (published languages for static forms, every
 * language for forms read from forms-api). Bokmål is always available.
 */
const getAvailableLanguages = (languages: TranslationLang[] = []): TranslationLang[] =>
  Array.from(new Set<TranslationLang>(['nb', ...languages.map(toLanguage)]));

const getCurrentLanguage = (search: string, availableLanguages: TranslationLang[]): TranslationLang => {
  const requestedLanguage = new URLSearchParams(search).get('lang');
  if (!requestedLanguage) {
    return 'nb';
  }

  const normalizedLanguage = toLanguage(requestedLanguage);
  return availableLanguages.includes(normalizedLanguage) ? normalizedLanguage : 'nb';
};

/**
 * The URL is the single source of truth for the active language so the language selector and
 * `?lang` deep links always take effect. A draft language (`initialLanguage`) only seeds the
 * language on first load, when no `lang` param is present yet.
 */
const resolveActiveLanguage = (
  search: string,
  availableLanguages: TranslationLang[],
  initialLanguage?: TranslationLang,
): TranslationLang => {
  if (new URLSearchParams(search).has('lang')) {
    return getCurrentLanguage(search, availableLanguages);
  }

  return initialLanguage && availableLanguages.includes(initialLanguage) ? initialLanguage : 'nb';
};

export { getAvailableLanguages, getCurrentLanguage, resolveActiveLanguage };
