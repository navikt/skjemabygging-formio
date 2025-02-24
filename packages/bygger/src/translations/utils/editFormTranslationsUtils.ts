import { getCountries } from '@navikt/skjemadigitalisering-shared-components';
import { Form, FormsApiFormTranslation, FormsApiGlobalTranslation } from '@navikt/skjemadigitalisering-shared-domain';
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
  form: Form,
  storedTranslations: Record<string, FormsApiFormTranslation>,
  globalTranslations: Record<string, FormsApiGlobalTranslation>,
): FormsApiFormTranslation[] => {
  const textObjects = getFormTexts(form, false);
  const countries = getCountries('nb');

  return (
    textObjects
      // We filter out any country names to avoid having to maintain their translations
      // All country names on 'nn' and 'en' are added from a third party package when we build the i18n object in FyllUt
      .filter(({ text }) => !countries.some((country) => country.label === text))
      .map(({ text }) => {
        const populatedTranslation = populateFromStoredTranslations(text, storedTranslations);
        return checkForGlobalOverride(populatedTranslation, globalTranslations);
      })
  );
};

export { generateAndPopulateTranslationsForForm };
