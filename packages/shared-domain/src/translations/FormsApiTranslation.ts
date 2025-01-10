import { TranslationTag } from '../languages/types';

type TranslationLang = 'nb' | 'nn' | 'en';
type FormsApiTranslationCore = {
  [key in TranslationLang]?: string;
} & {
  id?: number;
  key: string;
  revision?: number;
  changedAt?: string;
  changedBy?: string;
};

type FormsApiGlobalTranslation = FormsApiTranslationCore & { tag: TranslationTag };
type FormsApiFormTranslation = FormsApiTranslationCore & { globalTranslationId?: number };
type FormsApiTranslation = FormsApiGlobalTranslation | FormsApiFormTranslation;

const isGlobalTranslation = (translation: FormsApiTranslation): translation is FormsApiGlobalTranslation =>
  !!(translation as FormsApiGlobalTranslation).tag;

const isFormTranslation = (translation: FormsApiTranslation): translation is FormsApiFormTranslation =>
  !isGlobalTranslation(translation);

const formsApiTranslations = { isFormTranslation, isGlobalTranslation };
export { formsApiTranslations };
export type { FormsApiFormTranslation, FormsApiGlobalTranslation, FormsApiTranslation, TranslationLang };
