import { TextField, TextFieldProps } from '@navikt/ds-react';
import { ChangeEvent, useEffect, useRef } from 'react';
import { useForm } from '../../../../context/form/FormContext';
import { useValidator, Validators } from '../../../../context/validator/ValidatorContext';
import formComponentUtils from '../../../../form-components/utils/formComponent';
import FormBox, { FormBoxProps } from './FormBox';
import TranslatedDescription from './TranslatedDescription';
import TranslatedLabel from './TranslatedLabel';

interface FormTextFieldProps extends Omit<TextFieldProps, 'onChange' | 'ref' | 'required'>, FormBoxProps {
  submissionPath: string;
  label: string;
  description?: string;
  validators?: Pick<Validators, 'required'>;
  onChange?: (value: string) => void;
}

const FormTextField = (props: FormTextFieldProps) => {
  const {
    submissionPath,
    label,
    description,
    validators = { required: true },
    bottom = 'space-40',
    inputWidth,
    onChange,
    ...rest
  } = props;
  const { updateSubmission, submission } = useForm();
  const { addValidation, removeValidation, getRefError } = useValidator();

  const ref = useRef(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    if (onChange) {
      onChange(value);
    }

    updateSubmission(submissionPath, value);
  };

  useEffect(() => {
    addValidation(submissionPath, ref, validators, label);
    return () => {
      removeValidation(submissionPath);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FormBox inputWidth={inputWidth} bottom={bottom}>
      <TextField
        label={
          <TranslatedLabel options={{ required: validators?.required, readOnly: rest.readOnly }}>
            {label}
          </TranslatedLabel>
        }
        description={<TranslatedDescription>{description}</TranslatedDescription>}
        onChange={handleChange}
        ref={ref}
        error={getRefError(ref)}
        defaultValue={formComponentUtils.getSubmissionValue(submissionPath, submission)}
        {...rest}
      />
    </FormBox>
  );
};

export default FormTextField;
export type { FormTextFieldProps };
