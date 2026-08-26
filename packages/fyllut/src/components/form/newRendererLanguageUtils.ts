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

export { getAvailableLanguages, getCurrentLanguage };
