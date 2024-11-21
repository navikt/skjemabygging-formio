import { TranslationTag } from '../languages/types';

type FormsApiTranslation = {
  id?: number;
  key: string;
  revision?: number;
  nb?: string;
  nn?: string;
  en?: string;
  changedAt?: string;
  changedBy?: string;
};

export type FormsApiGlobalTranslation = FormsApiTranslation & { tag: TranslationTag };
