import {
  FormsApiTranslation,
  FormsApiTranslationMap,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';
import { createPublishedTranslationService, toTranslationMap } from './publishedTranslationService';
import translationClient from './translationClient';

const formsSources = ['formsapi-staging', 'formsapi-published'] as const;
type FormsSource = (typeof formsSources)[number];

type GlobalTranslationClient = Pick<
  typeof translationClient,
  'getGlobalTranslations' | 'getPublishedGlobalTranslations'
>;

interface CreateGlobalTranslationServiceProps {
  baseUrl: string;
  formsSource: FormsSource;
  client?: GlobalTranslationClient;
}

type GlobalTranslationService = {
  getGlobalTranslations: (languageCode: TranslationLang) => Promise<FormsApiTranslationMap>;
};

const isFormsSource = (value: string): value is FormsSource => formsSources.includes(value as FormsSource);

const toLanguageTranslations = (translations: FormsApiTranslation[], languageCode: TranslationLang) =>
  Object.fromEntries(
    translations.flatMap((translation) =>
      translation[languageCode] ? [[translation.key, translation[languageCode]]] : [],
    ),
  );

/**
 * Global translations for one language from forms-api.
 *
 * - `formsapi-staging` serves the latest revision, including unpublished changes. It is not cached, so edits show up
 *   at once, and failures propagate to the caller.
 * - `formsapi-published` serves published translations with caching and fallback, see
 *   `createPublishedTranslationService`.
 */
const createGlobalTranslationService = ({
  baseUrl,
  formsSource,
  client = translationClient,
}: CreateGlobalTranslationServiceProps): GlobalTranslationService => {
  if (formsSource === 'formsapi-published') {
    return createPublishedTranslationService({ baseUrl, client });
  }

  return {
    getGlobalTranslations: async (languageCode) => {
      const translations = await client.getGlobalTranslations({ baseUrl, languageCodes: [languageCode] });
      return toTranslationMap(languageCode, toLanguageTranslations(translations ?? [], languageCode));
    },
  };
};

export { createGlobalTranslationService, isFormsSource };
export type { FormsSource, GlobalTranslationService };
