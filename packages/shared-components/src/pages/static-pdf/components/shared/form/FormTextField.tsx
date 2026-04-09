import { FormTextField as SharedFrontendFormTextField } from '@navikt/skjemadigitalisering-shared-frontend';
import { type RefObject } from 'react';
import { useAppConfig } from '../../../../../context/config/configContext';
import { useForm } from '../../../../../context/form/FormContext';
import { useLanguages } from '../../../../../context/languages';
import { useInputValidation, type Validators } from '../../../../../context/validator/InputValidationContext';
import type { FormBoxProps } from './FormBox';

type FormInputWidth = 'input--xxs' | 'input--xs' | 'input--s' | 'input--m' | 'input--l' | 'input--xl' | 'input--xxl';

interface FormTextFieldProps extends FormBoxProps {
  submissionPath: string;
  label: string;
  description?: string;
  validators?: Pick<Validators, 'required' | 'minLength' | 'maxLength' | 'nationalIdentityNumber' | 'coverPage'>;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  error?: string;
  autoComplete?: string;
  width?: FormInputWidth;
}

const FormTextField = (props: FormTextFieldProps) => {
  const { logger } = useAppConfig();
  const { updateSubmission, submission } = useForm();
  const { translate } = useLanguages();
  const { addValidation, errors, getRefError, removeValidation } = useInputValidation();

  return (
    <SharedFrontendFormTextField
      {...props}
      runtime={{
        logger,
        submission,
        translate,
        updateSubmission,
        validation: {
          addValidation: (submissionPath, ref, validators, field) =>
            addValidation(submissionPath, ref as RefObject<HTMLInputElement>, validators, field),
          errors,
          getRefError: (ref) => getRefError(ref as RefObject<HTMLInputElement>),
          removeValidation,
        },
      }}
    />
  );
};

export default FormTextField;
export type { FormTextFieldProps };
