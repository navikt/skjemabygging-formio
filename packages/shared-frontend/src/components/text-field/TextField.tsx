import { TextField as AkselTextField } from '@navikt/ds-react';
import {
  ChangeEvent,
  FocusEvent,
  FormEvent,
  HTMLAttributes,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
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
  autoComplete?: string | boolean;
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode'];
  type?: SupportedTextFieldType;
  spellCheck?: boolean;
  formatKey?: string;
  prefillValue?: string;
  toDisplayValue?: (value: unknown) => string;
  toStateValue?: (value: string) => unknown;
  value?: string;
  onChange?: (value: string) => void;
  error?: ReactNode;
  maxLength?: number;
}

const resolveAutoComplete = (autoComplete?: string | boolean) => {
  if (autoComplete === false || autoComplete === undefined || autoComplete === '') {
    return 'off';
  }

  return autoComplete === true ? 'on' : autoComplete;
};

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
  toDisplayValue,
  toStateValue,
  value: controlledValue,
  onChange: controlledOnChange,
  error: controlledError,
  maxLength,
  readMore,
  fieldSize,
  marginBottom,
}: TextFieldProps) => {
  const { stateValue, error, setStateValue } = useStateField({ statePath });
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isFocusedRef = useRef(false);
  const formatDisplayValue = useCallback(
    (value: unknown) => (toDisplayValue ? toDisplayValue(value) : toInputFormat(value, formatKey)),
    [formatKey, toDisplayValue],
  );
  const [displayValue, setDisplayValue] = useState(() =>
    formatDisplayValue(
      controlledOnChange
        ? controlledValue
        : (stateValue ?? (typeof prefillValue === 'string' && prefillValue.trim() !== '' ? prefillValue : undefined)),
    ),
  );
  const syncedDisplayValue = formatDisplayValue(
    controlledOnChange
      ? controlledValue
      : (stateValue ?? (typeof prefillValue === 'string' && prefillValue.trim() !== '' ? prefillValue : undefined)),
  );
  const resolvedAutoComplete = resolveAutoComplete(autoComplete);

  const updateValue = useCallback(
    (value: string) => {
      const nextStateValue = toStateValue ? toStateValue(value) : toSubmissionFormat(value, formatKey);
      setDisplayValue((previousValue) => (previousValue === value ? previousValue : value));
      if (controlledOnChange) {
        controlledOnChange(value);
      } else if (!Object.is(stateValue, nextStateValue)) {
        setStateValue(nextStateValue);
      }
    },
    [controlledOnChange, formatKey, setStateValue, stateValue, toStateValue],
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateValue(event.target.value);
  };

  const handleInput = (event: FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateValue(event.currentTarget.value);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    isFocusedRef.current = false;
    const rawValue = event.currentTarget.value;
    const formatted = formatDisplayValue(rawValue);
    setDisplayValue(formatted);
    const nextStateValue = toStateValue ? toStateValue(rawValue) : toSubmissionFormat(rawValue, formatKey);
    if (controlledOnChange) {
      controlledOnChange(formatted);
    } else if (!Object.is(stateValue, nextStateValue)) {
      setStateValue(nextStateValue);
    }
  };

  useEffect(() => {
    if (readOnly || isFocusedRef.current) {
      return;
    }

    setDisplayValue((previousValue) => (previousValue === syncedDisplayValue ? previousValue : syncedDisplayValue));
  }, [readOnly, syncedDisplayValue]);

  useEffect(() => {
    const inputElement = inputRef.current;
    if (!inputElement || readOnly) {
      return;
    }

    const handleNativeValueChange = (event: Event) => {
      updateValue((event.currentTarget as HTMLInputElement).value);
    };

    inputElement.addEventListener('input', handleNativeValueChange);
    inputElement.addEventListener('change', handleNativeValueChange);

    return () => {
      inputElement.removeEventListener('input', handleNativeValueChange);
      inputElement.removeEventListener('change', handleNativeValueChange);
    };
  }, [readOnly, updateValue]);

  return (
    <FormElementBox fieldSize={fieldSize} marginBottom={marginBottom}>
      <AkselTextField
        ref={inputRef}
        id={inputId(statePath)}
        label={
          <TranslatedLabel required={required} readOnly={readOnly} showOptionalText={!hideLabel && showOptionalText}>
            {label}
          </TranslatedLabel>
        }
        description={<TranslatedDescription>{description}</TranslatedDescription>}
        hideLabel={hideLabel}
        value={readOnly ? formatDisplayValue(stateValue) : displayValue}
        onFocus={() => {
          isFocusedRef.current = true;
        }}
        onInput={handleInput}
        onInputCapture={handleInput}
        onChangeCapture={handleInput}
        onChange={handleChange}
        onBlur={handleBlur}
        error={controlledError ?? error}
        readOnly={readOnly}
        autoComplete={resolvedAutoComplete}
        inputMode={inputMode}
        type={type}
        spellCheck={spellCheck}
        maxLength={maxLength}
      />
      {readMore && <ReadMore {...readMore} />}
    </FormElementBox>
  );
};

export default TextField;
export type { SupportedTextFieldType, TextFieldProps };
