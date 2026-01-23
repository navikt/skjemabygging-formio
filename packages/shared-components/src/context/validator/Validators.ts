import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback } from 'react';
import formComponentUtils from '../../form-components/utils/formComponent';
import { useForm } from '../form/FormContext';
import { useLanguages } from '../languages';
import { Validators } from './ValidatorContext';

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

  const isRequired = (value: any) => {
    return value === '' || value === null || value === undefined || (Array.isArray(value) && value.length === 0);
  };

  const isMinLength = (value: any, minLength: number) => {
    return (typeof value === 'string' || value instanceof String) && value.length < minLength;
  };

  const isMaxLength = (value: any, maxLength: number) => {
    return (typeof value === 'string' || value instanceof String) && value.length > maxLength;
  };

  const validateRequired = useCallback(
    (componentValidation: FormComponentValidation, value: any, errors: FormComponentError[]) => {
      const { submissionPath, ref, field, validators } = componentValidation;

      if (validators?.required === true) {
        if (isRequired(value)) {
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
        if (isMinLength(value, validators?.minLength)) {
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
        if (isMaxLength(value, validators?.maxLength)) {
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

            return errors;
          })
          .filter((componentError) => componentError !== undefined) ?? []
      );
    },
    [submission, validateMaxLength, validateMinLength, validateRequired],
  );

  return {
    validateAll,
  };
};

export default useValidators;

export type { FormComponentError, FormComponentValidation };
