import { TextField } from '@navikt/ds-react';
import InputBox, { Spacing } from '../../input/InputBox';
import TranslatedDescription from '../../input/TranslatedDescription';
import TranslatedLabel from '../../input/TranslatedLabel';
import { inputId } from '../../input/inputId';
import { useTextInput } from '../../input/useTextInput';

interface InputTextFieldProps {
  submissionPath: string;
  label: string;
  description?: string;
  required?: boolean;
  readOnly?: boolean;
  autoComplete?: string;
  formatKey?: string;
  bottom?: Spacing;
}

const InputTextField = ({
  submissionPath,
  label,
  description,
  required = true,
  readOnly,
  autoComplete,
  formatKey,
  bottom,
}: InputTextFieldProps) => {
  const { value, onChange, onBlur, error } = useTextInput({ submissionPath, formatKey });

  return (
    <InputBox bottom={bottom}>
      <TextField
        id={inputId(submissionPath)}
        label={
          <TranslatedLabel required={required} readOnly={readOnly}>
            {label}
          </TranslatedLabel>
        }
        description={<TranslatedDescription>{description}</TranslatedDescription>}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        error={error}
        readOnly={readOnly}
        autoComplete={autoComplete}
      />
    </InputBox>
  );
};

export default InputTextField;
export type { InputTextFieldProps };
