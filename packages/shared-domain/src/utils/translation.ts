import { I18nTranslationMap, I18nTranslationReplacements } from '../languages/types';

const translateWithTextReplacements = ({
  originalText = '',
  params = {},
  translations = {},
  currentLanguage = 'nb-NO',
}: {
  originalText: string;
  params?: I18nTranslationReplacements;
  translations?: I18nTranslationMap;
  currentLanguage?: string;
}): string => {
  const currentTranslation = currentLanguage ? translations?.[currentLanguage] : translations;

  return currentTranslation && currentTranslation[originalText]
    ? injectParams(currentTranslation[originalText], params, translations, currentLanguage)
    : injectParams(originalText, params, translations, currentLanguage);
};

const injectParams = (
  template: string,
  params?: I18nTranslationReplacements,
  translations?: I18nTranslationMap,
  currentLanguage?: string,
) => {
  if (template && params) {
    return template.replace(
      /{{2}([^{}]*)}{2}/g,
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
