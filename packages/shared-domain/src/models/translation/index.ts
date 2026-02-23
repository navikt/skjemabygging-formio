import { Tkey } from '../../texts';

type TranslationLang = 'nb' | 'nn' | 'en';
type FormsApiTranslationLanguages = {
  [key in TranslationLang]?: string;
};
type FormsApiTranslation = FormsApiTranslationLanguages & {
  id?: number;
  key: string;
  revision?: number;
  changedAt?: string;
  changedBy?: string;
  tag?: TranslationTag;
  globalTranslationId?: number; // only applicable for form translations
};
type FormsApiTranslationMap = {
  [key: string]: FormsApiTranslationLanguages;
};

type PublishedTranslations = {
  publishedAt: string;
  publishedBy: string;
  translations: { nb?: Record<string, string>; nn?: Record<string, string>; en?: Record<string, string> };
};

import { FormioResource } from '../resource';

type Language = 'nb-NO' | 'nn-NO' | 'en';
type TranslationScope = 'global' | 'local' | 'component-countryName';
type TranslationTag = 'introPage' | 'skjematekster' | 'grensesnitt' | 'statiske-tekster' | 'validering' | 'dummy-tag';
type I18nTranslationMap = Record<string, string>;
type I18nTranslationReplacements = Record<string | number, any>;
type I18nTranslations = Record<string, I18nTranslationMap>;

interface ScopedTranslationMap {
  [key: string]: { value?: string; scope: TranslationScope };
}

interface FormioTranslation {
  id?: string;
  translations: ScopedTranslationMap;
}

type FormioTranslationMap = {
  [key in Language]?: FormioTranslation;
};

type TranslationResource = {
  id: string;
  name: string;
  scope: TranslationScope;
  tag: TranslationTag;
  translations: ScopedTranslationMap;
};

interface FormioTranslationData {
  name: string;
  scope: TranslationScope;
  form?: string;
  tag: TranslationTag | '';
  language: Language;
  i18n: I18nTranslationMap;
}

interface FormioTranslationPayload extends FormioResource {
  data: FormioTranslationData;
}

type TranslateFunction = (text?: string | Tkey, textReplacements?: I18nTranslationReplacements) => string;

export type {
  FormioTranslation,
  FormioTranslationData,
  FormioTranslationMap,
  FormioTranslationPayload,
  FormsApiTranslation,
  FormsApiTranslationMap,
  I18nTranslationMap,
  I18nTranslationReplacements,
  I18nTranslations,
  Language,
  PublishedTranslations,
  ScopedTranslationMap,
  TranslateFunction,
  TranslationLang,
  TranslationResource,
  TranslationScope,
  TranslationTag,
};
