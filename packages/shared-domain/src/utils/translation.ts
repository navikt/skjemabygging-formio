import { I18nTranslationMap, I18nTranslationReplacements, I18nTranslations } from '../languages/types';
import { Tkey } from '../texts/externalStorage';

const translateWithTextReplacements = ({
  textOrKey = '',
  params,
  translations = {},
  currentLanguage = 'nb-NO',
}: {
  textOrKey: string | Tkey;
  params?: I18nTranslationReplacements;
  translations?: I18nTranslations | I18nTranslationMap;
  currentLanguage?: string;
}) => {
  const currentTranslation =
    currentLanguage && translations?.[currentLanguage] ? translations?.[currentLanguage] : translations;

  return currentTranslation && currentTranslation[textOrKey]
    ? injectParams(currentTranslation[textOrKey], params, translations, currentLanguage)
    : injectParams(textOrKey, params, translations, currentLanguage);
};

const injectParams = (
  template: string | number,
  params?: I18nTranslationReplacements,
  translations?: I18nTranslations | I18nTranslationMap,
  currentLanguage?: string,
) => {
  if (template && params && typeof template === 'string') {
    return template.replace(
      /{{2}([^{}]+)}{2}/g,
      (match, $1) => translateWithTextReplacements({ textOrKey: params[$1], translations, currentLanguage }) || match,
    );
  }
  return template;
};

const translationUtils = {
  translateWithTextReplacements,
};
export default translationUtils;
