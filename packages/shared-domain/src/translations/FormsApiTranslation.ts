import { TranslationTag } from '../languages/types';
import dateUtils from '../utils/date';

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

const findMostRecentlyChanged = (data: FormsApiTranslation[] | undefined): FormsApiTranslation | undefined => {
  if (!data || data.length === 0) return undefined;
  return data.reduce((prev, curr) => {
    if (!prev?.changedAt || (curr.changedAt && dateUtils.isAfter(curr.changedAt, prev.changedAt))) {
      return curr;
    }
    return prev;
  });
};

const formsApiTranslations = { findMostRecentlyChanged };
export { formsApiTranslations };
export type { FormsApiTranslation, FormsApiTranslationMap, PublishedTranslations, TranslationLang };
