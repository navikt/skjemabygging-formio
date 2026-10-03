import { Form } from '@navikt/skjemadigitalisering-shared-domain';

const DEFAULT_LANGUAGE = 'nb';

const toBaseLanguage = (language: string) => {
  const baseLanguage = language.split('-')[0].toLowerCase();
  return baseLanguage === 'no' ? DEFAULT_LANGUAGE : baseLanguage;
};

// publishedLanguages describes the latest publication, so it is only reliable for a published revision
const isUnpublishedLanguage = (lang: unknown, form: Pick<Form, 'status' | 'publishedLanguages'>) => {
  if (typeof lang !== 'string' || !lang || form.status !== 'published' || !form.publishedLanguages) {
    return false;
  }

  const requestedLanguage = toBaseLanguage(lang);
  if (requestedLanguage === DEFAULT_LANGUAGE) {
    return false;
  }

  return !form.publishedLanguages.some((language) => toBaseLanguage(language) === requestedLanguage);
};

export { isUnpublishedLanguage };
