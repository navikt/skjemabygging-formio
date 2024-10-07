import { DatePicker as AkselDatePicker, useDatepicker } from '@navikt/ds-react';
import { UseDatepickerOptions } from '@navikt/ds-react/esm/date/hooks/useDatepicker';
import { dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode, useEffect } from 'react';
import { useComponentUtils } from '../../context/component/componentUtilsContext';
import { validateDate } from './dateValidation';

interface NavDatePickerProps {
  id: string;
  required?: boolean;
  onChange: (val: string) => void;
  value: string;
  readOnly?: boolean;
  error?: string;
  inputRef?: any;
  label: ReactNode;
  description?: ReactNode;
  className?: string;
  fromDate?: string;
  toDate?: string;
  defaultMonth?: string;
}

const DatePicker = ({
  id,
  required,
  onChange,
  value,
  readOnly,
  error,
  inputRef,
  label,
  description,
  className,
  fromDate,
  toDate,
  defaultMonth,
}: NavDatePickerProps) => {
  const { locale } = useComponentUtils();

  const { datepickerProps, inputProps, setSelected, reset } = useDatepicker({
    required: required,
    toDate: toDate ? dateUtils.toJSDate(toDate) : undefined,
    fromDate: fromDate ? dateUtils.toJSDate(fromDate) : undefined,
    defaultMonth: defaultMonth ? dateUtils.toJSDate(defaultMonth) : dateUtils.getDefaultDateFromRange(fromDate, toDate),
    allowTwoDigitYear: false,
  } as UseDatepickerOptions);

  useEffect(() => {
    // Only set selected if the value is different from the existing datepicker value.
    if (inputProps.value !== (value ?? '')) {
      if (value) {
        if (dateUtils.isValid(value, 'submission')) {
          setSelected(dateUtils.toJSDate(value));
        }
      } else {
        reset();
      }
    }
  }, [value]);

  useEffect(() => {
    let newValue = inputProps.value as string;
    if (dateUtils.isValid(newValue, 'input')) {
      newValue = dateUtils.toSubmissionDate(newValue);
    }

    // Ignore newValue if empty since we cant differentiate between initial load and the user clearing the value.
    if (newValue !== '' && newValue !== value) {
      onChange(newValue);
    }
  }, [inputProps.value]);

  return (
    <AkselDatePicker
      mode="single"
      locale={locale}
      {...datepickerProps}
      selected={undefined}
      dropdownCaption={!!(fromDate && toDate)}
    >
      <AkselDatePicker.Input
        id={id}
        {...inputProps}
        readOnly={readOnly}
        error={error}
        ref={inputRef}
        hideLabel={!label}
        label={label}
        description={description}
        className={className}
        onBlur={(e) => {
          // Since we have problem listening on empty value on inputProps.value
          // we need to trigger onChange on blur when there is an empty value.
          if (e.target.value === '') {
            onChange('');
          }
        }}
      />
    </AkselDatePicker>
  );
};

export default DatePicker;

export { validateDate };
