import { I18nTranslationMap, I18nTranslationReplacements, I18nTranslations } from '../languages/types';

const translateWithTextReplacements = ({
  originalText = '',
  params = {},
  translations = {},
  currentLanguage = 'nb-NO',
}: {
  originalText: string;
  params?: I18nTranslationReplacements;
  translations?: I18nTranslations | I18nTranslationMap;
  currentLanguage?: string;
}) => {
  const currentTranslation =
    currentLanguage && translations?.[currentLanguage] ? translations?.[currentLanguage] : translations;

  return currentTranslation && currentTranslation[originalText]
    ? injectParams(currentTranslation[originalText], params, translations, currentLanguage)
    : injectParams(originalText, params, translations, currentLanguage);
};

const injectParams = (
  template: string | I18nTranslationMap,
  params?: I18nTranslationReplacements,
  translations?: I18nTranslations | I18nTranslationMap,
  currentLanguage?: string,
) => {
  if (template && params && typeof template === 'string') {
    return template.replace(
      /{{2}([^{}]+)}{2}/g,
      (match, $1) =>
        translateWithTextReplacements({ originalText: params[$1], translations, currentLanguage }) || match,
    );
  }
  return template;
};

const translationUtils = {
  translateWithTextReplacements,
};
export default translationUtils;
