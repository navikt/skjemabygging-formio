import {
  Form,
  FormsApiTranslationMap,
  localizationUtils,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';

const toLanguage = (languageCode: string): TranslationLang => localizationUtils.getLanguageCodeAsIso639_1(languageCode);

const getAvailableLanguages = (form: Form, translations: FormsApiTranslationMap): TranslationLang[] => {
  const publishedLanguages = form.publishedLanguages ?? form.properties.publishedLanguages;
  const languageCodes =
    publishedLanguages && publishedLanguages.length > 0
      ? publishedLanguages
      : Object.values(translations).flatMap((translation) =>
          Object.entries(translation)
            .filter(([, value]) => !!value)
            .map(([language]) => language),
        );

  return Array.from(new Set<TranslationLang>(['nb', ...languageCodes.map(toLanguage)]));
};

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
