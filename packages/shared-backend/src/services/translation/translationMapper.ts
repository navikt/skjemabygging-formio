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
    const validationFallback = TEXTS.validering[currentItem.key as keyof typeof TEXTS.validering];
    const translation = {
      nb: currentItem.nb ?? validationFallback,
      nn: currentItem.nn,
      en: currentItem.en,
    };
    accumulator[currentItem.key] = translation;
    if (validationFallback) {
      accumulator[validationFallback] = translation;
    }
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

export {
  convertI18nTranslationsToFormsApiTranslationMap,
  convertToFormsApiTranslationMap,
  getGlobalTranslationFilename,
};
