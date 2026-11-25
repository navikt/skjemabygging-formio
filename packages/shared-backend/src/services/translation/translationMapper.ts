import {
  FormsApiTranslation,
  FormsApiTranslationMap,
  I18nTranslations,
  localizationUtils,
  TEXTS,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';
import { getCountryNameTranslations } from './countryNameTranslations';

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

type TranslationDictionaries = Partial<Record<TranslationLang, Record<string, string>>>;

// Builds one row per key, so every language for a key reaches convertToFormsApiTranslationMap together.
const convertDictionariesToFormsApiTranslations = (dictionaries: TranslationDictionaries): FormsApiTranslation[] => {
  const rows = new Map<string, FormsApiTranslation>();
  for (const [languageCode, translations] of Object.entries(dictionaries)) {
    for (const [key, value] of Object.entries(translations)) {
      rows.set(key, { ...rows.get(key), key, [languageCode]: value });
    }
  }
  return [...rows.values()];
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

const addTranslationDefaults = (translations: FormsApiTranslationMap): FormsApiTranslationMap =>
  addValidationDefaults({ ...getCountryNameTranslations(), ...translations });

export {
  addTranslationDefaults,
  addValidationDefaults,
  convertDictionariesToFormsApiTranslations,
  convertI18nTranslationsToFormsApiTranslationMap,
  convertToFormsApiTranslationMap,
  getGlobalTranslationFilename,
};
export type { TranslationDictionaries };
