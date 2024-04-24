import { DatePicker as AkselDatePicker, DatePickerProps, useDatepicker } from '@navikt/ds-react';
import { UseDatepickerOptions } from '@navikt/ds-react/esm/date/hooks/useDatepicker';
import { DateTime } from 'luxon';
import { useEffect } from 'react';

const SUBMISSION_DATE_FORMAT = 'yyyy-MM-dd';

interface NavDatePickerProps {
  id: string;
  isRequired?: boolean;
  onChange: (val: string) => void;
  value: string;
  locale: string;
  readOnly?: boolean;
  error?: string;
  inputRef?: any;
  label?: string;
  description?: string;
  className?: string;
  fromDate?: Date;
  toDate?: Date;
  defaultMonth?: Date;
}

const DatePicker = ({
  id,
  isRequired,
  onChange,
  value,
  locale,
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
  // @ts-ignore
  const { datepickerProps, inputProps, setSelected, reset }: DatePickerProps = useDatepicker({
    required: isRequired,
    onDateChange: (val) => {
      onChange(val ? DateTime.fromJSDate(val).toFormat(SUBMISSION_DATE_FORMAT) : '');
    },
    toDate: toDate,
    fromDate: fromDate,
    defaultMonth: defaultMonth,
  } as UseDatepickerOptions);

  useEffect(() => {
    if (value) {
      setSelected(DateTime.fromISO(value).toJSDate());
    } else {
      reset();
    }
  }, [value]);

  return (
    <AkselDatePicker
      selected={value ? DateTime.fromISO(value).toJSDate() : undefined}
      locale={locale}
      {...datepickerProps}
    >
      <AkselDatePicker.Input
        id={id}
        readOnly={readOnly}
        error={error}
        {...inputProps}
        ref={inputRef}
        hideLabel={!label}
        label={label}
        className={className}
        description={description}
      />
    </AkselDatePicker>
  );
};

export default DatePicker;
