import {
  Form,
  FormsApiTranslation,
  FormsApiTranslationMap,
  FormWithLanguages,
  ResponseError,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';
import formClient from '../form/formClient';
import { resolveFormLanguages } from '../form/formLanguages';
import translationClient from '../translation/translationClient';
import { convertToFormsApiTranslationMap, toTranslationMap } from '../translation/translationMapper';
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

const mapTranslations = (translations: FormsApiTranslation[]): FormsApiTranslationMap => {
  if (
    !Array.isArray(translations) ||
    !translations.every(
      (translation) =>
        translation &&
        typeof translation.key === 'string' &&
        [translation.nb, translation.nn, translation.en].every(
          (value) => value === undefined || value === null || typeof value === 'string',
        ),
    )
  ) {
    throw new ResponseError('SERVICE_UNAVAILABLE', 'Invalid forms-api translation response');
  }
  return convertToFormsApiTranslationMap(translations);
};

const createContentService = ({ baseUrl, source }: CreateContentServiceProps): ContentService => {
  if (source !== 'published' && source !== 'latest') {
    throw new Error('Content source must be published or latest');
  }
  const transport = { baseUrl, source, timeoutMs: FETCH_TIMEOUT_MS };
  // Latest content must show edits immediately, so only published content is cached.
  const cache = source === 'published' ? createContentCache(PUBLISHED_CACHE_TTL_MS) : undefined;
  const cached = <T>(key: string, load: () => Promise<T>) => (cache ? cache.get(key, load) : load());

  const fetchForm = async (formPath: string) => {
    const form = await loadContent(() => formClient.getForm<Form>({ ...transport, formPath }));
    if (!form || typeof form.path !== 'string' || !Array.isArray(form.components) || !form.properties) {
      throw new ResponseError('SERVICE_UNAVAILABLE', 'Invalid forms-api form response');
    }
    return { ...form, languages: resolveFormLanguages(form, source === 'latest') };
  };

  const fetchFormTranslations = async ({ formPath, languageCode }: FormTranslationRequest) => {
    const translations = await loadContent(() =>
      translationClient.getFormTranslations({ ...transport, formPath, languageCodes: [languageCode] }),
    );
    return mapTranslations(translations);
  };

  const fetchGlobalTranslations = async (languageCode: TranslationLang) => {
    if (source === 'published') {
      const translations = await loadContent(() =>
        translationClient.getPublishedGlobalTranslations({ ...transport, languageCode }),
      );
      if (
        !translations ||
        typeof translations !== 'object' ||
        Object.getPrototypeOf(translations) !== Object.prototype ||
        !Object.values(translations).every((value) => typeof value === 'string')
      ) {
        throw new ResponseError('SERVICE_UNAVAILABLE', 'Invalid forms-api translation response');
      }
      return toTranslationMap(languageCode, translations);
    }
    const translations = await loadContent(() =>
      translationClient.getGlobalTranslations({ ...transport, languageCodes: [languageCode] }),
    );
    return mapTranslations(translations);
  };

  const getForm: ContentService['getForm'] = ({ formPath }) => cached(`form:${formPath}`, () => fetchForm(formPath));

  const getFormTranslations: ContentService['getFormTranslations'] = (props) =>
    cached(`form-translations:${props.formPath}:${props.languageCode}`, () => fetchFormTranslations(props));

  const getGlobalTranslations: ContentService['getGlobalTranslations'] = (languageCode) =>
    cached(`global-translations:${languageCode}`, () => fetchGlobalTranslations(languageCode));

  const getTranslations: ContentService['getTranslations'] = async (props) => {
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
