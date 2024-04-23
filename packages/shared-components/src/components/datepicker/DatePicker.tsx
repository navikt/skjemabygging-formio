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
  label: string;
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
    toDate: toDate ? new Date(toDate) : undefined,
    fromDate: fromDate ? new Date(fromDate) : undefined,
    defaultMonth: defaultMonth ? new Date(defaultMonth) : undefined,
    allowTwoDigitYear: false,
  } as UseDatepickerOptions);

  useEffect(() => {
    if (value) {
      if (dateUtils.isValid(value, 'submission')) {
        setSelected(new Date(value));
      }
    } else {
      reset();
    }
  }, [value]);

  useEffect(() => {
    onChange(inputProps.value as string);
  }, [inputProps.value]);

  return (
    <AkselDatePicker mode="single" locale={locale as any} {...datepickerProps}>
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
      />
    </AkselDatePicker>
  );
};

export default DatePicker;

export { validateDate };
