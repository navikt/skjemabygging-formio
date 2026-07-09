import { TextField } from '@navikt/ds-react';
import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import InputBox, { Spacing } from '../../input/InputBox';
import TranslatedDescription from '../../input/TranslatedDescription';
import TranslatedLabel from '../../input/TranslatedLabel';
import { inputId } from '../../input/inputId';
import { useTextInput } from '../../input/useTextInput';

type SupportedTextFieldType = 'text' | 'tel' | 'url' | 'email' | 'password' | 'number' | 'time';

interface InputTextFieldProps {
  pageKey: string;
  pageComponents: Component[];
  submissionPath: string;
  label: string;
  description?: string;
  required?: boolean;
  readOnly?: boolean;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  type?: SupportedTextFieldType;
  spellCheck?: boolean;
  formatKey?: string;
  bottom?: Spacing;
}

const InputTextField = ({
  pageKey,
  pageComponents,
  submissionPath,
  label,
  description,
  required = true,
  readOnly,
  autoComplete,
  inputMode,
  type,
  spellCheck,
  formatKey,
  bottom,
}: InputTextFieldProps) => {
  const { value, onChange, onBlur, error } = useTextInput({ pageKey, pageComponents, submissionPath, formatKey });

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
        inputMode={inputMode}
        type={type}
        spellCheck={spellCheck}
      />
    </InputBox>
  );
};

export default InputTextField;
export type { InputTextFieldProps };
