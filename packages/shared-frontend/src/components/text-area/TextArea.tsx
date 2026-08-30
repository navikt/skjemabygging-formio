import { Textarea } from '@navikt/ds-react';
import { ChangeEvent, FocusEvent, useEffect, useRef, useState } from 'react';
import { useStateField } from '../../context/state/useStateField';
import { toInputFormat, toSubmissionFormat } from '../../formatting/inputFormat';
import { inputId } from '../../utils/inputId';
import ReadMore from '../read-more/ReadMore';
import FormElementBox from '../shared/FormElementBox';
import TranslatedDescription from '../shared/TranslatedDescription';
import TranslatedLabel from '../shared/TranslatedLabel';
import { BaseFieldProps } from '../types';

interface TextAreaProps extends BaseFieldProps {
  label: string;
  maxLength?: number;
  value?: string;
  onChange?: (value: string) => void;
}

const TextArea = ({
  statePath,
  label,
  description,
  required = true,
  readOnly,
  maxLength,
  value: controlledValue,
  onChange: controlledOnChange,
  readMore,
  fieldSize,
  marginBottom,
}: TextAreaProps) => {
  const { stateValue, error, setStateValue } = useStateField({ statePath });
  const isFocusedRef = useRef(false);
  const sourceValue = controlledOnChange ? controlledValue : stateValue;
  const syncedDisplayValue = toInputFormat(sourceValue);
  const [displayValue, setDisplayValue] = useState(syncedDisplayValue);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const rawValue = event.target.value;
    setDisplayValue(rawValue);
    if (controlledOnChange) {
      controlledOnChange(toSubmissionFormat(rawValue));
    } else {
      setStateValue(toSubmissionFormat(rawValue));
    }
  };

  const handleBlur = (event: FocusEvent<HTMLTextAreaElement>) => {
    isFocusedRef.current = false;
    const trimmedValue = toInputFormat(event.target.value);
    setDisplayValue(trimmedValue);
    if (controlledOnChange) {
      controlledOnChange(trimmedValue);
    } else {
      setStateValue(toSubmissionFormat(event.target.value));
    }
  };

  useEffect(() => {
    if (!isFocusedRef.current) {
      setDisplayValue((previousValue) => (previousValue === syncedDisplayValue ? previousValue : syncedDisplayValue));
    }
  }, [syncedDisplayValue]);

  return (
    <FormElementBox fieldSize={fieldSize} marginBottom={marginBottom}>
      <Textarea
        id={inputId(statePath)}
        label={
          <TranslatedLabel required={required} readOnly={readOnly}>
            {label}
          </TranslatedLabel>
        }
        description={<TranslatedDescription>{description}</TranslatedDescription>}
        value={displayValue}
        onFocus={() => {
          isFocusedRef.current = true;
        }}
        onChange={handleChange}
        onBlur={handleBlur}
        error={error}
        readOnly={readOnly}
        maxLength={maxLength}
      />
      {readMore && <ReadMore {...readMore} />}
    </FormElementBox>
  );
};

export default TextArea;
export type { TextAreaProps };
