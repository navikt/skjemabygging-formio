import { TranslationTag } from '../languages/types';

type FormsApiTranslationCore = {
  id?: number;
  key: string;
  revision?: number;
  nb?: string;
  nn?: string;
  en?: string;
  changedAt?: string;
  changedBy?: string;
};

type FormsApiGlobalTranslation = FormsApiTranslationCore & { tag: TranslationTag };
type FormsApiFormTranslation = FormsApiTranslationCore & { globalTranslationId?: number };
type FormsApiTranslation = FormsApiGlobalTranslation | FormsApiFormTranslation;

export type { FormsApiFormTranslation, FormsApiGlobalTranslation, FormsApiTranslation };
