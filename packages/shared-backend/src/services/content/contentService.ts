import {
  Form,
  FormsApiTranslation,
  FormsApiTranslationMap,
  FormWithLanguages,
  ResponseError,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';
import urlUtil from '../../util/url/urlUtil';
import formClient from '../form/formClient';
import { resolveFormLanguages } from '../form/formLanguages';
import translationClient from '../translation/translationClient';
import {
  convertDictionaryToFormsApiTranslations,
  convertToFormsApiTranslationMap,
} from '../translation/translationMapper';
import { createContentCache } from './contentCache';
import type { ContentSource } from './contentSource';
import { loadContent } from './loadContent';

const FETCH_TIMEOUT_MS = 5000;
const PUBLISHED_CACHE_TTL_MS = 5 * 60 * 1000;

interface FormTranslationRequest {
  formPath: string;
  languageCode: TranslationLang;
}

type ContentService = {
  getForm: (props: { formPath: string }) => Promise<FormWithLanguages>;
  getFormTranslations: (props: FormTranslationRequest) => Promise<FormsApiTranslationMap>;
  getGlobalTranslations: (languageCode: TranslationLang) => Promise<FormsApiTranslationMap>;
  getTranslations: (props: FormTranslationRequest) => Promise<FormsApiTranslationMap>;
};

interface CreateContentServiceProps {
  baseUrl: string;
  source: ContentSource;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isOptionalString = (value: unknown) => value === undefined || value === null || typeof value === 'string';

const isTranslationRows = (value: unknown): value is FormsApiTranslation[] =>
  Array.isArray(value) &&
  value.every(
    (row) => isRecord(row) && typeof row.key === 'string' && [row.nb, row.nn, row.en].every(isOptionalString),
  );

const isTranslationDictionary = (value: unknown): value is Record<string, string> =>
  isRecord(value) &&
  Object.getPrototypeOf(value) === Object.prototype &&
  Object.values(value).every((translation) => typeof translation === 'string');

const invalidTranslationResponse = () =>
  new ResponseError('SERVICE_UNAVAILABLE', 'Invalid forms-api translation response');

const mapTranslationRows = (translations: unknown): FormsApiTranslationMap => {
  if (!isTranslationRows(translations)) {
    throw invalidTranslationResponse();
  }
  return convertToFormsApiTranslationMap(translations);
};

const mapTranslationDictionary = (languageCode: TranslationLang, translations: unknown): FormsApiTranslationMap => {
  if (!isTranslationDictionary(translations)) {
    throw invalidTranslationResponse();
  }
  return convertToFormsApiTranslationMap(convertDictionaryToFormsApiTranslations(languageCode, translations));
};

const assertValidFormPath = (formPath: string) => {
  if (!urlUtil.isValidPath(formPath)) {
    throw new ResponseError('BAD_REQUEST', 'Invalid form path');
  }
};

const createContentService = ({ baseUrl, source }: CreateContentServiceProps): ContentService => {
  const transport = { baseUrl, timeoutMs: FETCH_TIMEOUT_MS };
  // Latest content must show edits immediately, so only published content is cached.
  const cache = source === 'published' ? createContentCache(PUBLISHED_CACHE_TTL_MS) : undefined;
  const cached = <T>(key: string, load: () => Promise<T>) => (cache ? cache.get(key, load) : load());

  const fetchForm = async (formPath: string) => {
    const form = await loadContent('form', source, () =>
      source === 'published'
        ? formClient.getPublishedForm<Form>({ ...transport, formPath })
        : formClient.getForm<Form>({ ...transport, formPath }),
    );
    if (!form || typeof form.path !== 'string' || !Array.isArray(form.components) || !form.properties) {
      throw new ResponseError('SERVICE_UNAVAILABLE', 'Invalid forms-api form response');
    }
    return { ...form, languages: resolveFormLanguages(form, source === 'latest') };
  };

  const fetchFormTranslations = async ({ formPath, languageCode }: FormTranslationRequest) => {
    const request = { ...transport, formPath, languageCodes: [languageCode] };
    if (source === 'published') {
      const response = await loadContent('form translations', source, () =>
        translationClient.getPublishedFormTranslations(request),
      );
      if (!isRecord(response) || !isRecord(response.translations)) {
        throw invalidTranslationResponse();
      }
      return mapTranslationDictionary(languageCode, response.translations[languageCode] ?? {});
    }
    const translations = await loadContent('form translations', source, () =>
      translationClient.getFormTranslations(request),
    );
    return mapTranslationRows(translations);
  };

  const fetchGlobalTranslations = async (languageCode: TranslationLang) => {
    if (source === 'published') {
      const translations = await loadContent('global translations', source, () =>
        translationClient.getPublishedGlobalTranslations({ ...transport, languageCode }),
      );
      return mapTranslationDictionary(languageCode, translations);
    }
    const translations = await loadContent('global translations', source, () =>
      translationClient.getGlobalTranslations({ ...transport, languageCodes: [languageCode] }),
    );
    return mapTranslationRows(translations);
  };

  const getForm: ContentService['getForm'] = async ({ formPath }) => {
    assertValidFormPath(formPath);
    return cached(`form:${formPath}`, () => fetchForm(formPath));
  };

  const getFormTranslations: ContentService['getFormTranslations'] = async (props) => {
    assertValidFormPath(props.formPath);
    return cached(`form-translations:${props.formPath}:${props.languageCode}`, () => fetchFormTranslations(props));
  };

  const getGlobalTranslations: ContentService['getGlobalTranslations'] = (languageCode) =>
    cached(`global-translations:${languageCode}`, () => fetchGlobalTranslations(languageCode));

  const getTranslations: ContentService['getTranslations'] = async (props) => {
    assertValidFormPath(props.formPath);
    const [globalTranslations, formTranslations] = await Promise.all([
      getGlobalTranslations(props.languageCode),
      getFormTranslations(props),
    ]);
    return { ...globalTranslations, ...formTranslations };
  };

  return { getForm, getFormTranslations, getGlobalTranslations, getTranslations };
};

export { createContentService };
export type { ContentService };
