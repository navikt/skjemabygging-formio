import {
  FormsApiFormTranslation,
  FormsApiGlobalTranslation,
  NavFormType,
} from '@navikt/skjemadigitalisering-shared-domain';
import { getFormTexts } from '../../old_translations/utils';

const populateFromStoredTranslations = (text: string, storedTranslations: Record<string, FormsApiFormTranslation>) => {
  const stored = storedTranslations?.[text];
  if (stored && stored.globalTranslationId) {
    return stored;
  } else if (stored) {
    return { nb: text, ...stored };
  }
  return { key: text, nb: text };
};

const checkForGlobalOverride = (
  translation: FormsApiFormTranslation,
  globalTranslations: Record<string, FormsApiGlobalTranslation>,
) => {
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

  return textObjects.map(({ text }) => {
    const populatedTranslation = populateFromStoredTranslations(text, storedTranslations);
    return checkForGlobalOverride(populatedTranslation, globalTranslations);
  });
};

export { generateAndPopulateTranslationsForForm };
