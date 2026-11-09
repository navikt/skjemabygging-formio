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

// Validation texts are stored under their key (e.g. "required"), but the new renderer looks them up by their
// Bokmål text, so they are also stored under that text.
const addTranslation = (
  accumulator: FormsApiTranslationMap,
  key: string,
  translation: FormsApiTranslationMap[string],
): FormsApiTranslationMap => {
  const validationFallback = Object.hasOwn(TEXTS.validering, key)
    ? TEXTS.validering[key as keyof typeof TEXTS.validering]
    : undefined;
  if (!validationFallback) {
    accumulator[key] = translation;
    return accumulator;
  }

  const validationTranslation = { ...translation, nb: translation.nb ?? validationFallback };
  accumulator[key] = validationTranslation;
  accumulator[validationFallback] = validationTranslation;
  return accumulator;
};

const convertToFormsApiTranslationMap = (translations: FormsApiTranslation[]): FormsApiTranslationMap => {
  return translations.reduce(
    (accumulator, currentItem: FormsApiTranslation) =>
      addTranslation(accumulator, currentItem.key, {
        nb: currentItem.nb,
        nn: currentItem.nn,
        en: currentItem.en,
      }),
    {} as FormsApiTranslationMap,
  );
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
  return Object.entries(result).reduce(
    (accumulator, [key, translation]) => addTranslation(accumulator, key, translation),
    {} as FormsApiTranslationMap,
  );
};

export {
  convertI18nTranslationsToFormsApiTranslationMap,
  convertToFormsApiTranslationMap,
  getGlobalTranslationFilename,
};
