import { TextField as AkselTextField } from '@navikt/ds-react';
import { ChangeEvent, FocusEvent, HTMLAttributes, useState } from 'react';
import { useStateField } from '../../context/state/useStateField';
import { toInputFormat, toSubmissionFormat } from '../../formatting/inputFormat';
import { inputId } from '../../utils/inputId';
import InputBox from '../input/InputBox';
import TranslatedDescription from '../input/TranslatedDescription';
import TranslatedLabel from '../input/TranslatedLabel';
import { BaseFieldProps } from '../types';

type SupportedTextFieldType = 'text' | 'tel' | 'url' | 'email' | 'number' | 'time';

interface TextFieldProps extends BaseFieldProps {
  label: string;
  autoComplete?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode'];
  type?: SupportedTextFieldType;
  spellCheck?: boolean;
  formatKey?: string;
}

const TextField = ({
  statePath,
  label,
  description,
  required = true,
  readOnly,
  autoComplete,
  inputMode,
  type,
  spellCheck,
  formatKey,
  marginBottom,
}: TextFieldProps) => {
  const { stateValue, error, setStateValue } = useStateField({ statePath });
  const [displayValue, setDisplayValue] = useState(() => toInputFormat(stateValue, formatKey));

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDisplayValue(event.target.value);
    setStateValue(toSubmissionFormat(event.target.value, formatKey));
  };

  const handleBlur = (_event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const formatted = toInputFormat(displayValue, formatKey);
    setDisplayValue(formatted);
    setStateValue(toSubmissionFormat(displayValue, formatKey));
  };

  return (
    <InputBox marginBottom={marginBottom}>
      <AkselTextField
        id={inputId(statePath)}
        label={
          <TranslatedLabel required={required} readOnly={readOnly}>
            {label}
          </TranslatedLabel>
        }
        description={<TranslatedDescription>{description}</TranslatedDescription>}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
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

export default TextField;
export type { SupportedTextFieldType, TextFieldProps };
