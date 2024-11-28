import { FormsApiFormTranslation, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { getFormTexts } from '../../old_translations/utils';

const generateAndPopulateTranslationsForForm = (
  form: NavFormType,
  storedTranslations: Record<string, FormsApiFormTranslation>,
): FormsApiFormTranslation[] => {
  const textObjects = getFormTexts(form, false);
  return textObjects.map(({ text }) => {
    const stored = storedTranslations?.[text];
    if (stored && stored.globalTranslationId) {
      return stored;
    } else if (stored) {
      return { nb: text, ...stored };
    }
    return { key: text, nb: text };
  });
};

export { generateAndPopulateTranslationsForForm };
