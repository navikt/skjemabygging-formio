import {
  FormsApiTranslation,
  FormsApiTranslationMap,
  I18nTranslations,
  localizationUtils,
  TEXTS,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';

const getGlobalTranslationFilename = (lang: TranslationLang): string => {
  switch (lang) {
    case 'nb':
      return 'global-translations-nb-NO';
    case 'nn':
      return 'global-translations-nn-NO';
    case 'en':
      return 'global-translations-en';
  }
};

const convertToFormsApiTranslationMap = (translations: FormsApiTranslation[]): FormsApiTranslationMap => {
  return translations.reduce((accumulator, currentItem: FormsApiTranslation) => {
    accumulator[currentItem.key] = {
      nb: currentItem.nb,
      nn: currentItem.nn,
      en: currentItem.en,
    };
    return accumulator;
  }, {} as FormsApiTranslationMap);
};

const convertI18nTranslationsToFormsApiTranslationMap = (
  i18nTranslations: I18nTranslations,
): FormsApiTranslationMap => {
  const result: FormsApiTranslationMap = {};
  for (const [lang, translations] of Object.entries(i18nTranslations)) {
    const mappedLang = localizationUtils.getLanguageCodeAsIso639_1(lang);
    if (mappedLang !== 'nb' && mappedLang !== 'nn' && mappedLang !== 'en') {
      continue;
    }
    for (const [key, value] of Object.entries(translations)) {
      if (!result[key]) {
        result[key] = {};
      }
      result[key][mappedLang] = value;
    }
  }
  return result;
};

// Validation texts are stored under their key (e.g. "maxYear"), usually without a Bokmål value, so the
// Bokmål text from the code is used unless a Bokmål value is stored.
const addValidationDefaults = (translations: FormsApiTranslationMap): FormsApiTranslationMap => ({
  ...translations,
  ...Object.fromEntries(
    Object.entries(TEXTS.validering).map(([key, nb]) => [
      key,
      { ...translations[key], nb: translations[key]?.nb || nb },
    ]),
  ),
});

export {
  addValidationDefaults,
  convertI18nTranslationsToFormsApiTranslationMap,
  convertToFormsApiTranslationMap,
  getGlobalTranslationFilename,
};
