import { TextField } from '@navikt/ds-react';
import { ChangeEvent, useEffect, useRef } from 'react';
import { useAppConfig } from '../../../../context/config/configContext';
import { useForm } from '../../../../context/form/FormContext';
import { useInputValidation, Validators } from '../../../../context/validator/InputValidationContext';
import formComponentUtils from '../../../../form-components/utils/formComponent';
import FormBox, { FormBoxProps } from './FormBox';
import TranslatedDescription from './TranslatedDescription';
import TranslatedLabel from './TranslatedLabel';

interface FormTextFieldProps extends FormBoxProps {
  submissionPath: string;
  label: string;
  description?: string;
  validators?: Pick<Validators, 'required' | 'minLength' | 'maxLength'>;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  error?: string;
  autoComplete?: string;
}

const FormTextField = (props: FormTextFieldProps) => {
  const {
    submissionPath,
    label,
    description,
    validators,
    bottom = 'space-40',
    inputWidth,
    onChange,
    readOnly,
    error,
    autoComplete,
  } = props;
  const { logger } = useAppConfig();
  const { updateSubmission, submission } = useForm();
  const { addValidation, removeValidation, getRefError } = useInputValidation();
  const { required, minLength, maxLength } = validators || { required: true };

  const ref = useRef(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    if (onChange) {
      onChange(value);
    }

    updateSubmission(submissionPath, value);
  };

  useEffect(() => {
    logger?.debug(`Add validation for ${submissionPath}`);
    addValidation(submissionPath, ref, { required, minLength, maxLength }, label);
    return () => {
      logger?.debug(`Remove validation for ${submissionPath}`);
      removeValidation(submissionPath);
    };
  }, [logger, addValidation, removeValidation, submissionPath, ref, label, required, minLength, maxLength]);

  return (
    <FormBox inputWidth={inputWidth} bottom={bottom}>
      <TextField
        label={<TranslatedLabel options={{ required, readOnly: readOnly }}>{label}</TranslatedLabel>}
        description={<TranslatedDescription>{description}</TranslatedDescription>}
        onChange={handleChange}
        ref={ref}
        error={error ?? getRefError(ref)}
        defaultValue={formComponentUtils.getSubmissionValue(submissionPath, submission)}
        autoComplete={autoComplete}
      />
    </FormBox>
  );
};

export default FormTextField;
export type { FormTextFieldProps };
