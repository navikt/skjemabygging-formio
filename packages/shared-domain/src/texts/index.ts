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

export { externalStorageTexts, TEXTS };

export type { TElement, Tkey };
