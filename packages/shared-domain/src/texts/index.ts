import common from './common';
import externalStorageTexts from './externalStorage';
import { TElement, Tkey } from './externalStorage/keys';
import { grensesnitt } from './grensesnitt';
import { statiske } from './statiskeTekster';
import { validering } from './validering';

const TEXTS = {
  common,
  grensesnitt,
  statiske,
  validering,
};

export { introPageTexts } from './externalStorage/keys';
export type {
  DataDisclosureTitle,
  IntroPageKey,
  OutOfScopeTitle,
  PrerequisitesTitle,
  ScopeTitle,
  SelfDeclarationDescription,
} from './externalStorage/keys';
export { externalStorageTexts, TEXTS };

export type { TElement, Tkey };
