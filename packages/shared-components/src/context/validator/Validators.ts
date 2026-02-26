import { TEXTS, validatorUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback } from 'react';
import { validateNationalIdentityNumber as validateNationalIdentityNumberUtil } from '../../components/identity/NationalIdentityNumberValidator';
import formComponentUtils from '../../form-components/utils/formComponent';
import { useForm } from '../form/FormContext';
import { useLanguages } from '../languages';

interface Validators {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  nationalIdentityNumber?: boolean;
  coverPage?: boolean;
}

interface FormComponentValidation {
  submissionPath: string;
  ref?: React.RefObject<HTMLInputElement>;
  field: string;
  validators: Validators;
}

interface FormComponentError {
  submissionPath: string;
  ref?: React.RefObject<HTMLInputElement>;
  message: string;
}

const useValidators = () => {
  const { translate } = useLanguages();
  const { submission } = useForm();

  const validateRequired = useCallback(
    (componentValidation: FormComponentValidation, value: any, errors: FormComponentError[]) => {
      const { submissionPath, ref, field, validators } = componentValidation;

      if (validators?.required === true) {
        if (validatorUtils.isEmpty(value)) {
          errors.push({ submissionPath, ref, message: translate(TEXTS.validering.required, { field }) });
        }
      }
    },
    [translate],
  );

  const validateMinLength = useCallback(
    (componentValidation: FormComponentValidation, value: any, errors: FormComponentError[]) => {
      const { submissionPath, ref, field, validators } = componentValidation;
      if (validators?.minLength !== undefined) {
        if (!validatorUtils.isValidMinLength(value, validators?.minLength)) {
          errors.push({
            submissionPath,
            ref,
            message: translate(TEXTS.validering.minLength, { field, length: validators.minLength }),
          });
        }
      }
    },
    [translate],
  );

  const validateMaxLength = useCallback(
    (componentValidation: FormComponentValidation, value: any, errors: FormComponentError[]) => {
      const { submissionPath, ref, field, validators } = componentValidation;
      if (validators?.maxLength !== undefined) {
        if (!validatorUtils.isValidMaxLength(value, validators?.maxLength)) {
          errors.push({
            submissionPath,
            ref,
            message: translate(TEXTS.validering.maxLength, { field, length: validators.maxLength }),
          });
        }
      }
    },
    [translate],
  );

  const validateNationalIdentityNumber = useCallback(
    (componentValidation: FormComponentValidation, value: any, errors: FormComponentError[]) => {
      const { submissionPath, ref, validators } = componentValidation;
      if (validators?.nationalIdentityNumber) {
        // This function should function probably be split up to only return true false, so we can have message in this file.
        // Also need to add support for test types in test environments, but that can be done laster.
        const message = validateNationalIdentityNumberUtil({ value, allowTestTypes: true }, translate);
        if (message) {
          errors.push({
            submissionPath,
            ref,
            message,
          });
        }
      }
    },
    [translate],
  );

  const validateCoverPage = useCallback(
    (componentValidation: FormComponentValidation, value: any, errors: FormComponentError[]) => {
      const { submissionPath, ref, field, validators } = componentValidation;
      if (validators?.coverPage) {
        if (!validatorUtils.isValidCoverPageValue(value)) {
          errors.push({
            submissionPath,
            ref,
            message: translate(TEXTS.validering.containsInvalidCharacters, { field }),
          });
        }
      }
    },
    [translate],
  );

  const validateAll = useCallback(
    (componentValidations: FormComponentValidation[]): FormComponentError[] => {
      return (
        componentValidations
          .flatMap((componentValidation) => {
            const { submissionPath } = componentValidation;
            const value = formComponentUtils.getSubmissionValue(submissionPath, submission);
            const errors: FormComponentError[] = [];

            validateRequired(componentValidation, value, errors);
            validateMinLength(componentValidation, value, errors);
            validateMaxLength(componentValidation, value, errors);
            validateNationalIdentityNumber(componentValidation, value, errors);
            validateCoverPage(componentValidation, value, errors);

            return errors;
          })
          .filter((componentError) => componentError !== undefined) ?? []
      );
    },
    [
      submission,
      validateMaxLength,
      validateMinLength,
      validateRequired,
      validateNationalIdentityNumber,
      validateCoverPage,
    ],
  );

  return {
    validateAll,
  };
};

export default useValidators;

export type { FormComponentError, FormComponentValidation, Validators };
