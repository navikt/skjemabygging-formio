import { FormsApiTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { TranslationError } from './errorUtils';

const isMissingKey = (translation: FormsApiTranslation) => !translation.key;

const isInputTooLong = ({ key, nb = '', nn = '', en = '' }: FormsApiTranslation) =>
  key.length > 1024 || nb.length > 1024 || nn.length > 1024 || en.length > 1024;

const validate = <T extends FormsApiTranslation>(
  translation: T,
  isNewTranslation: boolean = false,
): TranslationError | undefined => {
  if (isMissingKey(translation)) {
    return {
      key: translation.key,
      type: 'MISSING_KEY_VALIDATION',
      message: 'Legg til bokmålstekst for å opprette ny oversettelse',
      isNewTranslation,
    };
  }
  if (isInputTooLong(translation)) {
    return {
      key: translation.key,
      type: 'INPUT_TOO_LONG_VALIDATION',
      message: 'Teksten er for lang. Maksimal lengde er 1024 tegn',
      isNewTranslation,
    };
  }
};

const validateTranslations = (translations: FormsApiTranslation[]): TranslationError[] =>
  translations.map((translation) => validate(translation)).filter((validationError) => !!validationError);

export { validate, validateTranslations };
