import {
  FormsApiTranslation,
  FormsApiTranslationMap,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';
import translationClient from './translationClient';
import {
  convertDictionariesToFormsApiTranslations,
  convertToFormsApiTranslationMap,
  TranslationDictionaries,
} from './translationMapper';

type TranslationClient = typeof translationClient;

type TranslationSourceOptions =
  { source: 'latest'; languageCodes?: TranslationLang[] } | { source: 'published'; languageCodes: TranslationLang[] };

type LoadGlobalTranslationsProps = TranslationSourceOptions & {
  baseUrl: string;
  timeoutMs?: number;
  client?: TranslationClient;
};

type LoadFormTranslationsProps = LoadGlobalTranslationsProps & { formPath: string };

const mapTranslationRows = (translations?: FormsApiTranslation[]) =>
  translations ? convertToFormsApiTranslationMap(translations) : undefined;

const mapTranslationDictionaries = (dictionaries: TranslationDictionaries) =>
  convertToFormsApiTranslationMap(convertDictionariesToFormsApiTranslations(dictionaries));

// Returns undefined when forms-api responds without content, so each service decides whether that is an error.
const loadFormTranslations = async ({
  client = translationClient,
  ...props
}: LoadFormTranslationsProps): Promise<FormsApiTranslationMap | undefined> => {
  const { baseUrl, formPath, languageCodes, timeoutMs } = props;
  if (props.source === 'latest') {
    return mapTranslationRows(await client.getFormTranslations({ baseUrl, formPath, languageCodes, timeoutMs }));
  }

  const response = await client.getPublishedFormTranslations({
    baseUrl,
    formPath,
    languageCodes: props.languageCodes,
    timeoutMs,
  });
  return response ? mapTranslationDictionaries(response.translations) : undefined;
};

const loadGlobalTranslations = async ({
  client = translationClient,
  ...props
}: LoadGlobalTranslationsProps): Promise<FormsApiTranslationMap | undefined> => {
  const { baseUrl, languageCodes, timeoutMs } = props;
  if (props.source === 'latest') {
    return mapTranslationRows(await client.getGlobalTranslations({ baseUrl, languageCodes, timeoutMs }));
  }

  // The published endpoint accepts one language per request.
  const responses = await Promise.all(
    props.languageCodes.map((languageCode) =>
      client.getPublishedGlobalTranslations({ baseUrl, languageCode, timeoutMs }),
    ),
  );
  if (responses.some((response) => !response)) {
    return undefined;
  }
  return mapTranslationDictionaries(
    Object.fromEntries(props.languageCodes.map((languageCode, index) => [languageCode, responses[index]])),
  );
};

export { loadFormTranslations, loadGlobalTranslations };
export type { TranslationClient };
