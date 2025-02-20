import {
  FormsApiFormTranslation,
  FormsApiGlobalTranslation,
  FormsApiTranslation,
} from '@navikt/skjemadigitalisering-shared-domain';
import { TranslationError } from './errorUtils';

type Validator = (translation: FormsApiTranslation) => TranslationError | undefined;

const MAX_INPUT_LENGTH_FORM_TRANSLATION = 5120;
const MAX_INPUT_LENGTH_GLOBAL_TRANSLATION = 1024;

const isInputTooLong = ({ key, nb = '', nn = '', en = '' }: FormsApiTranslation, maxLength: number) =>
  key.length > maxLength || nb.length > maxLength || nn.length > maxLength || en.length > maxLength;
const createInputTooLongValidator =
  (maxLength: number, isNewTranslation = false): Validator =>
  (translation: FormsApiTranslation): TranslationError | undefined => {
    if (isInputTooLong(translation, maxLength)) {
      return {
        key: translation.key,
        type: 'INPUT_TOO_LONG_VALIDATION',
        message: `Teksten er for lang. Maksimal lengde er ${maxLength} tegn`,
        isNewTranslation,
      };
    }
  };

const isMissingKey = (translation: FormsApiTranslation) => !translation.key;
const createMissingKeyValidator =
  (): Validator =>
  (translation: FormsApiTranslation): TranslationError | undefined => {
    if (isMissingKey(translation)) {
      return {
        key: translation.key,
        type: 'MISSING_KEY_VALIDATION',
        message: 'Legg til bokmålstekst for å opprette ny oversettelse',
        isNewTranslation: true,
      };
    }
  };

const validateTranslation = (translation: FormsApiFormTranslation, validators: Validator[]) =>
  validators.map((validator) => validator(translation)).find((error) => !!error);

const validateTranslations = (translations: FormsApiTranslation[], validators: Validator[]): TranslationError[] =>
  translations
    .map((translation) => {
      return validators.map((validator) => validator(translation)).find((error) => !!error);
    })
    .filter((validationError) => !!validationError);

const validateFormTranslations = (translations: FormsApiFormTranslation[]): TranslationError[] => {
  const validators: Validator[] = [createInputTooLongValidator(MAX_INPUT_LENGTH_FORM_TRANSLATION)];
  return validateTranslations(translations, validators);
};

const validateGlobalTranslations = (translations: FormsApiGlobalTranslation[]): TranslationError[] => {
  const validators: Validator[] = [createInputTooLongValidator(MAX_INPUT_LENGTH_GLOBAL_TRANSLATION)];
  return validateTranslations(translations, validators);
};

const validateNewGlobalTranslation = (translation: FormsApiGlobalTranslation): TranslationError | undefined => {
  const validators: Validator[] = [
    createMissingKeyValidator(),
    createInputTooLongValidator(MAX_INPUT_LENGTH_GLOBAL_TRANSLATION, true),
  ];
  return validateTranslation(translation, validators);
};

export { validateFormTranslations, validateGlobalTranslations, validateNewGlobalTranslation };
