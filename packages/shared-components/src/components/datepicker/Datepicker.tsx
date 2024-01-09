import { DatePicker as AkselDatePicker, DatePickerProps, useDatepicker } from '@navikt/ds-react';
import { UseDatepickerOptions } from '@navikt/ds-react/esm/date/hooks/useDatepicker';
import moment from 'moment/moment';
import { useEffect } from 'react';

const SUBMISSION_DATE_FORMAT = 'YYYY-MM-DD';

const Datepicker = ({ id, isRequired, onChange, value, locale, readOnly, error, inputRef }) => {
  // @ts-ignore
  const { datepickerProps, inputProps, setSelected, reset }: DatePickerProps = useDatepicker({
    required: isRequired,
    onDateChange: (val) => {
      onChange(val ? moment(val).format(SUBMISSION_DATE_FORMAT) : '');
    },
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
      <AkselDatePicker.Input id={id} readOnly={readOnly} error={error} {...inputProps} ref={inputRef} hideLabel />
    </AkselDatePicker>
  );
};

export default Datepicker;
