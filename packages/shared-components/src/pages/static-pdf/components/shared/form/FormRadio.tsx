import { ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import { FormRadio as SharedFrontendFormRadio } from '@navikt/skjemadigitalisering-shared-frontend';
import { type RefObject } from 'react';
import { useAppConfig } from '../../../../../context/config/configContext';
import { useForm } from '../../../../../context/form/FormContext';
import { useLanguages } from '../../../../../context/languages';
import { useInputValidation, type Validators } from '../../../../../context/validator/InputValidationContext';
import type { FormBoxProps } from './FormBox';

interface FormRadioProps extends FormBoxProps {
  submissionPath: string;
  legend: string;
  values: ComponentValue[];
  description?: string;
  validators?: Pick<Validators, 'required'>;
  onChange?: (value: any) => void;
  readOnly?: boolean;
  error?: string;
}

const FormRadio = (props: FormRadioProps) => {
  const { logger } = useAppConfig();
  const { updateSubmission, submission } = useForm();
  const { translate } = useLanguages();
  const { addValidation, errors, getRefError, removeValidation } = useInputValidation();

  return (
    <SharedFrontendFormRadio
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

export default FormRadio;
export type { FormRadioProps };
