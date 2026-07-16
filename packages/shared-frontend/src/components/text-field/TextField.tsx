import { TextField as AkselTextField } from '@navikt/ds-react';
import { Component } from '@navikt/skjemadigitalisering-shared-domain';
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
  hideLabel?: boolean;
  showOptionalText?: boolean;
  autoComplete?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode'];
  type?: SupportedTextFieldType;
  spellCheck?: boolean;
  formatKey?: string;
  prefillValue?: Component['prefillValue'];
  toStateValue?: (value: string) => unknown;
}

const TextField = ({
  statePath,
  label,
  hideLabel,
  showOptionalText = true,
  description,
  required = true,
  readOnly,
  autoComplete,
  inputMode,
  type,
  spellCheck,
  formatKey,
  prefillValue,
  toStateValue,
  readMore,
  marginBottom,
}: TextFieldProps) => {
  const { stateValue, error, setStateValue } = useStateField({ statePath });
  const [displayValue, setDisplayValue] = useState(() =>
    toInputFormat(
      stateValue ?? (typeof prefillValue === 'string' && prefillValue.trim() !== '' ? prefillValue : undefined),
      formatKey,
    ),
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDisplayValue(event.target.value);
    setStateValue(toStateValue ? toStateValue(event.target.value) : toSubmissionFormat(event.target.value, formatKey));
  };

  const handleBlur = (_event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const formatted = toInputFormat(displayValue, formatKey);
    setDisplayValue(formatted);
    setStateValue(toStateValue ? toStateValue(displayValue) : toSubmissionFormat(displayValue, formatKey));
  };

  return (
    <FormElementBox marginBottom={marginBottom}>
      <AkselTextField
        id={inputId(statePath)}
        label={
          <TranslatedLabel required={required} readOnly={readOnly} showOptionalText={!hideLabel && showOptionalText}>
            {label}
          </TranslatedLabel>
        }
        description={<TranslatedDescription>{description}</TranslatedDescription>}
        hideLabel={hideLabel}
        value={readOnly ? toInputFormat(stateValue, formatKey) : displayValue}
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
