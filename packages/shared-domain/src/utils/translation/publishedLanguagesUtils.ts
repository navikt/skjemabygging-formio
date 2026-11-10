import { NavFormType } from '../../models';
import { localizationUtils } from './localizationUtils';

const DEFAULT_LANGUAGE = 'nb';

const isLanguageAllowedForForm = (
  lang: string | undefined,
  form: Pick<NavFormType, 'status' | 'publishedLanguages'>,
) => {
  if (!lang || form.status !== 'published' || !form.publishedLanguages) {
    return true;
  }

  const requestedLanguage = localizationUtils.getSupportedLanguageCode(lang) ?? lang;
  if (requestedLanguage === DEFAULT_LANGUAGE) {
    return true;
  }

  return form.publishedLanguages.some(
    (language) => (localizationUtils.getSupportedLanguageCode(language) ?? language) === requestedLanguage,
  );
};

export { isLanguageAllowedForForm };
