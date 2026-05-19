import {
  FormsApiTranslationMap,
  I18nTranslationMap,
  localizationUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { translationService } from '../services';

const toI18nTranslationMap = (translations: FormsApiTranslationMap, language: string): I18nTranslationMap => {
  const languageCode = localizationUtils.getLanguageCodeAsIso639_1(language.toLowerCase());

  return Object.entries(translations).reduce((accumulator, [key, value]) => {
    const translatedValue = value[languageCode] ?? value.nb;
    if (translatedValue) {
      accumulator[key] = translatedValue;
    }
    return accumulator;
  }, {} as I18nTranslationMap);
};

// TODO: Remove this and use FormsApiTranslationMap instead of I18nTranslationMap everywhere
const getTranslationsForForm = async (formPath: string | undefined, language: string): Promise<I18nTranslationMap> => {
  if (!formPath) {
    return {};
  }

  const translations = await translationService.getTranslations({ formPath });
  return toI18nTranslationMap(translations, language);
};

export { getTranslationsForForm };
