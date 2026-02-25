import { FormsApiTranslation } from '../../models';
import { dateUtils } from '../date';

const findMostRecentlyChanged = (data: FormsApiTranslation[] | undefined): FormsApiTranslation | undefined => {
  if (!data || data.length === 0) return undefined;
  return data.reduce((prev, curr) => {
    if (!prev?.changedAt || (curr.changedAt && dateUtils.isAfter(curr.changedAt, prev.changedAt))) {
      return curr;
    }
    return prev;
  });
};

const formsApiTranslationUtils = { findMostRecentlyChanged };
export { formsApiTranslationUtils };
