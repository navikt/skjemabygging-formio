import {
  Form,
  FormsApiTranslationMap,
  FormWithLanguages,
  ResponseError,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';
import urlUtil from '../../util/url/urlUtil';
import formClient from '../form/formClient';
import { resolveFormLanguages } from '../form/formLanguages';
import { loadFormTranslations, loadGlobalTranslations } from '../translation/translationLoader';
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

const requireTranslations = (translations: FormsApiTranslationMap | undefined) => {
  if (!translations) {
    throw new ResponseError('SERVICE_UNAVAILABLE', 'Missing forms-api translation response');
  }
  return translations;
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

  const fetchFormTranslations = async ({ formPath, languageCode }: FormTranslationRequest) =>
    requireTranslations(
      await loadContent('form translations', source, () =>
        loadFormTranslations({ ...transport, source, formPath, languageCodes: [languageCode] }),
      ),
    );

  const fetchGlobalTranslations = async (languageCode: TranslationLang) =>
    requireTranslations(
      await loadContent('global translations', source, () =>
        loadGlobalTranslations({ ...transport, source, languageCodes: [languageCode] }),
      ),
    );

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
