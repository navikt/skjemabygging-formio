import {
  FormsApiTranslation,
  FormsApiTranslationMap,
  I18nTranslationReplacements,
  TranslateFunction,
} from '../../models';
import { dateUtils } from '../date';
import { localizationUtils } from './localizationUtils';

const findMostRecentlyChanged = (data: FormsApiTranslation[] | undefined): FormsApiTranslation | undefined => {
  if (!data || data.length === 0) return undefined;
  return data.reduce((prev, curr) => {
    if (!prev?.changedAt || (curr.changedAt && dateUtils.isAfter(curr.changedAt, prev.changedAt))) {
      return curr;
    }
    return prev;
  });
};

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
  const translatedText = translation?.[language] ?? translation?.nb ?? textOrKey;

  if (!params) {
    return translatedText;
  }

  return translatedText.replace(/{{2}([^{}]+)}{2}/g, (match, paramKey: string) => {
    const replacement = params[paramKey];
    if (replacement === undefined || replacement === null) {
      return match;
    }
    return translate(translations, currentLanguage, String(replacement));
  });
};

const createTranslate = (translations: FormsApiTranslationMap, currentLanguage: string): TranslateFunction => {
  return (textOrKey, params) => translate(translations, currentLanguage, textOrKey, params);
};

const formsApiTranslationUtils = { createTranslate, findMostRecentlyChanged, translate };
export { formsApiTranslationUtils };
