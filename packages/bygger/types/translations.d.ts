export type Language = "nb-NO" | "nn-NO" | "en" | "pl";
export type LanguageCodeIso639_1 = "nb" | "nn" | "en" | "pl";
export type TranslationScope = "global" | "local" | "component-countryName";
export type TranslationTag = "skjematekster" | "grensesnitt" | "statiske-tekster" | "validering";
export type I18nTranslationMap = { [key: string]: string };

export interface ScopedTranslationMap {
  [key: string]: { value: string; scope: TranslationScope };
}

export interface FormioTranslation {
  id: string;
  translations: ScopedTranslationMap;
}

export interface FormioTranslationMap {
  [key: Language]: FormioTranslation[];
}

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
  roles: any[];
  data: FormioTranslationData;
  access: any[];
  form: string;
  externalIds: any[];
  created: string;
  modified: string;
}
