import { Form, localizationUtils, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';

const allLanguages: TranslationLang[] = ['nb', 'nn', 'en'];

/**
 * Static forms are published snapshots, so only published languages are offered. Forms read from
 * forms-api may be ahead of the last publication, so every language is offered for testing.
 */
const resolveFormLanguages = (
  form: Pick<Form, 'publishedLanguages'>,
  includeUnpublishedLanguages: boolean,
): TranslationLang[] => {
  if (includeUnpublishedLanguages) {
    return allLanguages;
  }

  const publishedLanguages = (form.publishedLanguages ?? []).map(
    (language) => localizationUtils.getLanguageCodeAsIso639_1(language) as TranslationLang,
  );

  return Array.from(new Set<TranslationLang>(['nb', ...publishedLanguages]));
};

export { resolveFormLanguages };
