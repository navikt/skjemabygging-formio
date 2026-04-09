import { ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import { FormCheckboxes as SharedFrontendFormCheckboxes } from '@navikt/skjemadigitalisering-shared-frontend';
import { type RefObject } from 'react';
import { useAppConfig } from '../../../../../context/config/configContext';
import { useForm } from '../../../../../context/form/FormContext';
import { useLanguages } from '../../../../../context/languages';
import { useInputValidation, type Validators } from '../../../../../context/validator/InputValidationContext';
import type { FormBoxProps } from './FormBox';

interface FormCheckboxGroupProps extends FormBoxProps {
  submissionPath: string;
  legend: string;
  values: ComponentValue[];
  description?: string;
  validators?: Pick<Validators, 'required'>;
  onChange?: (value: string[]) => void;
  readOnly?: boolean;
  error?: string;
}

const FormCheckboxes = (props: FormCheckboxGroupProps) => {
  const { logger } = useAppConfig();
  const { updateSubmission, submission } = useForm();
  const { translate } = useLanguages();
  const { addValidation, errors, getRefError, removeValidation } = useInputValidation();

  return (
    <SharedFrontendFormCheckboxes
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

export default FormCheckboxes;
export type { FormCheckboxGroupProps };
