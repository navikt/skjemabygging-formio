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
type PublishedTranslations = {
  publishedAt: string;
  publishedBy: string;
  translations: { nn?: Record<string, string>; en?: Record<string, string> };
};

const isGlobalTranslation = (translation: FormsApiTranslation): translation is FormsApiGlobalTranslation =>
  !!(translation as FormsApiGlobalTranslation).tag;

const isFormTranslation = (translation: FormsApiTranslation): translation is FormsApiFormTranslation =>
  !isGlobalTranslation(translation);

const findMostRecentlyChanged = <T extends FormsApiTranslationCore>(data: T[] | undefined): T | undefined => {
  if (!data || data.length === 0) return undefined;
  return data.reduce((prev, curr) => {
    if (!prev?.changedAt || (curr.changedAt && curr.changedAt > prev.changedAt)) {
      return curr;
    }
    return prev;
  });
};

const formsApiTranslations = { isFormTranslation, isGlobalTranslation, findMostRecentlyChanged };
export { formsApiTranslations };
export type {
  FormsApiFormTranslation,
  FormsApiGlobalTranslation,
  FormsApiTranslation,
  PublishedTranslations,
  TranslationLang,
};
