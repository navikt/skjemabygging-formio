export type Language = "nb-NO" | "nn-NO" | "en" | "pl";
export type TranslationScope = "global" | "local" | "component-countryName";
export type TranslationTag = "skjematekster" | "grensesnitt" | "statiske-tekster" | "validering";
export type I18nTranslationMap = Record<string, string>;
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
  form: string;
  tag: TranslationTag | "";
  language: Language;
  i18n: I18nTranslationMap;
}

export interface FormioTranslationPayload {
  _id: string;
  owner: string;
  roles: unknown[];
  data: FormioTranslationData;
  access: unknown[];
  form: string;
  externalIds: unknown[];
  created: string;
  modified: string;
}

export type GlobalTranslationMap = {
  [key in Language]?: TranslationResource[];
};
