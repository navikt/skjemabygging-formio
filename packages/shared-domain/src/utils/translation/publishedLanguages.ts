import { NavFormType } from '../../models';
import { localizationUtils } from './localizationUtils';

const DEFAULT_LANGUAGE = 'nb';

// publishedLanguages describes the latest publication, so it is only reliable for a published revision
const isUnpublishedLanguage = (lang: unknown, form: Pick<NavFormType, 'status' | 'publishedLanguages'>) => {
  if (typeof lang !== 'string' || !lang || form.status !== 'published' || !form.publishedLanguages) {
    return false;
  }

  const requestedLanguage = localizationUtils.getSupportedLanguageCode(lang) ?? lang;
  if (requestedLanguage === DEFAULT_LANGUAGE) {
    return false;
  }

  return !form.publishedLanguages.some(
    (language) => (localizationUtils.getSupportedLanguageCode(language) ?? language) === requestedLanguage,
  );
};

export { isUnpublishedLanguage };
