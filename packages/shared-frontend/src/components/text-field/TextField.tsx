import { TextField as AkselTextField } from '@navikt/ds-react';
import { ChangeEvent, FocusEvent, HTMLAttributes, useState } from 'react';
import { useStateField } from '../../context/state/useStateField';
import { toInputFormat, toSubmissionFormat } from '../../formatting/inputFormat';
import { inputId } from '../../utils/inputId';
import ReadMore from '../read-more/ReadMore';
import FormElementBox from '../shared/FormElementBox';
import TranslatedDescription from '../shared/TranslatedDescription';
import TranslatedLabel from '../shared/TranslatedLabel';
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
  readMore,
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
    <FormElementBox marginBottom={marginBottom}>
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
      {readMore && <ReadMore {...readMore} />}
    </FormElementBox>
  );
};

export default TextField;
export type { SupportedTextFieldType, TextFieldProps };
