import { TextField } from '@navikt/ds-react';
import { formComponentUtils } from '@navikt/skjemadigitalisering-shared-form';
import { ChangeEvent, useEffect, useRef } from 'react';
import { FormInputWidth, useFormInputStyles } from '../formStylingUtil';
import { SharedFormInputRuntime, SharedFormInputValidators } from '../types';
import FormBox, { FormBoxProps } from './FormBox';
import TranslatedDescription from './TranslatedDescription';
import TranslatedLabel from './TranslatedLabel';

interface FormTextFieldProps extends FormBoxProps {
  submissionPath: string;
  label: string;
  description?: string;
  runtime: SharedFormInputRuntime;
  validators?: Pick<
    SharedFormInputValidators,
    'required' | 'minLength' | 'maxLength' | 'nationalIdentityNumber' | 'coverPage'
  >;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  error?: string;
  autoComplete?: string;
  width?: FormInputWidth;
}

const FormTextField = (props: FormTextFieldProps) => {
  const {
    submissionPath,
    label,
    description,
    validators,
    bottom = 'space-32',
    width = 'input--xl',
    runtime,
    onChange,
    readOnly,
    error,
    autoComplete,
  } = props;
  const {
    logger,
    submission,
    translate,
    updateSubmission,
    validation: { addValidation, removeValidation, getRefError },
  } = runtime;
  const { required, minLength, maxLength, nationalIdentityNumber, coverPage } = validators || { required: true };
  const styles = useFormInputStyles();

  const ref = useRef<HTMLInputElement>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    if (onChange) {
      onChange(value);
    } else {
      updateSubmission(submissionPath, value);
    }
  };

  useEffect(() => {
    logger?.debug?.(`Add validation for ${submissionPath}`);
    addValidation(submissionPath, ref, { required, minLength, maxLength, nationalIdentityNumber, coverPage }, label);
    return () => {
      logger?.debug?.(`Remove validation for ${submissionPath}`);
      removeValidation(submissionPath);
    };
  }, [
    logger,
    addValidation,
    removeValidation,
    submissionPath,
    ref,
    label,
    required,
    minLength,
    maxLength,
    nationalIdentityNumber,
    coverPage,
  ]);

  return (
    <FormBox bottom={bottom}>
      <TextField
        className={styles[width]}
        label={
          <TranslatedLabel translate={translate} options={{ required, readOnly }}>
            {label}
          </TranslatedLabel>
        }
        description={<TranslatedDescription translate={translate}>{description}</TranslatedDescription>}
        onChange={handleChange}
        ref={ref}
        // eslint-disable-next-line react-hooks/refs
        error={error ?? getRefError(ref)}
        defaultValue={formComponentUtils.getSubmissionValue(submissionPath, submission)}
        autoComplete={autoComplete}
      />
    </FormBox>
  );
};

export default FormTextField;
export type { FormTextFieldProps };
