import { FormsApiTranslationMap, I18nTranslationReplacements, TranslateFunction } from '../../models';
import { localizationUtils } from './localizationUtils';

const translate = (
  translations: FormsApiTranslationMap,
  currentLanguage: string,
  textOrKey?: string,
  params?: I18nTranslationReplacements,
): string => {
  if (!textOrKey) {
    return '';
  }

  const language = localizationUtils.getLanguageCodeAsIso639_1(currentLanguage);
  const translation = translations[textOrKey];
  const translatedText = translation?.[language] || translation?.nb || textOrKey;

  if (!params) {
    return translatedText;
  }

  return translatedText.replace(/{{2}([^{}]+)}{2}/g, (match, paramKey: string) => {
    const normalizedParamKey = paramKey.replace(/^\s*-\s*/, '').trim();
    const replacement = params[normalizedParamKey];
    if (replacement === undefined || replacement === null) {
      return match;
    }
    return translate(translations, currentLanguage, String(replacement));
  });
};

const createTranslate = (translations: FormsApiTranslationMap, currentLanguage: string): TranslateFunction => {
  return (textOrKey, params) => translate(translations, currentLanguage, textOrKey, params);
};

const formsApiTranslationUtils = { createTranslate, translate };
export { formsApiTranslationUtils };
