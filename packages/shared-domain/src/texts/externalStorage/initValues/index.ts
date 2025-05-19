import { FormsApiTranslation } from '../../../translations/FormsApiTranslation';
import { Tkey } from '../keys';
import introPage from './introPage';

export type KeyBasedFormsApiTranslation = FormsApiTranslation & {
  key: Tkey;
};

const initValues: Record<string, KeyBasedFormsApiTranslation[]> = { introPage };
export default initValues;
