import { DatePicker as AkselDatePicker, DatePickerProps, useDatepicker } from '@navikt/ds-react';
import { UseDatepickerOptions } from '@navikt/ds-react/esm/date/hooks/useDatepicker';
import moment from 'moment/moment';
import { useEffect } from 'react';

const SUBMISSION_DATE_FORMAT = 'YYYY-MM-DD';

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
  className,
  fromDate,
  toDate,
  defaultMonth,
}: NavDatePickerProps) => {
  // @ts-ignore
  const { datepickerProps, inputProps, setSelected, reset }: DatePickerProps = useDatepicker({
    required: isRequired,
    onDateChange: (val) => {
      onChange(val ? moment(val).format(SUBMISSION_DATE_FORMAT) : '');
    },
    toDate: toDate,
    fromDate: fromDate,
    defaultMonth: defaultMonth,
  } as UseDatepickerOptions);

  useEffect(() => {
    if (value) {
      setSelected(moment(value, SUBMISSION_DATE_FORMAT).toDate());
    } else {
      reset();
    }
  }, [value]);

  return (
    <AkselDatePicker
      selected={value ? moment(value, SUBMISSION_DATE_FORMAT).toDate() : undefined}
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
      />
    </AkselDatePicker>
  );
};

export default DatePicker;
