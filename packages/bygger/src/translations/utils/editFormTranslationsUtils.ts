import {
  FormsApiFormTranslation,
  FormsApiGlobalTranslation,
  NavFormType,
} from '@navikt/skjemadigitalisering-shared-domain';
import { getFormTexts } from '../../old_translations/utils';

const getPopulateFromStoredTranslations =
  (storedTranslations: Record<string, FormsApiFormTranslation>) =>
  ({ text }) => {
    const stored = storedTranslations?.[text];
    if (stored && stored.globalTranslationId) {
      return stored;
    } else if (stored) {
      return { nb: text, ...stored };
    }
    return { key: text, nb: text };
  };

const getCheckForGlobalOverride =
  (globalTranslations: Record<string, FormsApiGlobalTranslation>) => (translation: FormsApiFormTranslation) => {
    const global = globalTranslations[translation.key];
    if (global && !translation.nn && !translation.en) {
      const { id, nn, en } = global;
      return { ...translation, globalTranslationId: id, nn, en };
    }
    return translation;
  };

const generateAndPopulateTranslationsForForm = (
  form: NavFormType,
  storedTranslations: Record<string, FormsApiFormTranslation>,
  globalTranslations: Record<string, FormsApiGlobalTranslation>,
): FormsApiFormTranslation[] => {
  const textObjects = getFormTexts(form, false);
  const populateStored = getPopulateFromStoredTranslations(storedTranslations);
  const addGlobalOverride = getCheckForGlobalOverride(globalTranslations);
  return textObjects.map(populateStored).map(addGlobalOverride);
};

export { generateAndPopulateTranslationsForForm };
