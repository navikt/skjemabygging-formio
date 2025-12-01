import { FormioResource } from '../resource';

export type Language = 'nb-NO' | 'nn-NO' | 'en';
export type TranslationScope = 'global' | 'local' | 'component-countryName';
export type TranslationTag =
  | 'introPage'
  | 'skjematekster'
  | 'grensesnitt'
  | 'statiske-tekster'
  | 'validering'
  | 'dummy-tag';
export type I18nTranslationMap = Record<string, string>;
export type I18nTranslationReplacements = Record<string | number, any>;
export type I18nTranslations = Record<string, I18nTranslationMap>;

export interface ScopedTranslationMap {
  [key: string]: { value?: string; scope: TranslationScope };
}

export interface FormioTranslation {
  id?: string;
  translations: ScopedTranslationMap;
}

export type FormioTranslationMap = {
  [key in Language]?: FormioTranslation;
};

export type TranslationResource = {
  id: string;
  name: string;
  scope: TranslationScope;
  tag: TranslationTag;
  translations: ScopedTranslationMap;
};

export interface FormioTranslationData {
  name: string;
  scope: TranslationScope;
  form?: string;
  tag: TranslationTag | '';
  language: Language;
  i18n: I18nTranslationMap;
}

export interface FormioTranslationPayload extends FormioResource {
  data: FormioTranslationData;
}

export type TranslateFunction = (text?: string, textReplacements?: I18nTranslationReplacements) => string;
