import { externalStorageTexts, Form, FormsApiTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { getTextKeysFromForm } from './formTextsUtils';

const populateFromStoredTranslations = (text: string, storedTranslations: Record<string, FormsApiTranslation>) => {
  const stored = storedTranslations?.[text];
  if (stored && stored.globalTranslationId) {
    return stored;
  } else if (stored) {
    return { nb: text, ...stored };
  }
  return { key: text, nb: text };
};

const checkForGlobalOverride = (
  translation: FormsApiTranslation,
  globalTranslations: Record<string, FormsApiTranslation>,
) => {
  const global = globalTranslations[translation.key];
  if (global && !translation.nn && !translation.en) {
    const { id, nn, en } = global;
    return { ...translation, globalTranslationId: id, nn, en };
  }
  return translation;
};

const generateAndPopulateTranslationsForForm = (
  form: Form,
  storedTranslations: Record<string, FormsApiTranslation>,
  globalTranslations: Record<string, FormsApiTranslation>,
): FormsApiTranslation[] => {
  // We filter out any country names to avoid having to maintain their translations
  // All country names on 'nn' and 'en' are added from a third party package when we build the i18n object in FyllUt)
  const textObjects = getTextKeysFromForm(form);
  const externalStorageKeys = Object.values(externalStorageTexts.keys).flatMap((keys) => keys);

  return textObjects
    .map((text) => {
      const populatedTranslation = populateFromStoredTranslations(text, storedTranslations);
      return checkForGlobalOverride(populatedTranslation, globalTranslations);
    })
    .filter(({ key }) => !(externalStorageKeys as string[]).includes(key));
};

const generateUnsavedGlobalTranslations = (
  form: Form,
  storedTranslations: Record<string, FormsApiTranslation>,
  globalTranslations: Record<string, FormsApiTranslation>,
) => {
  return generateAndPopulateTranslationsForForm(form, {}, globalTranslations).filter(
    (translation) => translation.globalTranslationId && !storedTranslations[translation.nb ?? translation.key],
  );
};

export { generateAndPopulateTranslationsForForm, generateUnsavedGlobalTranslations };
