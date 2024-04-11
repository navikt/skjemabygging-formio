import { DatePicker as AkselDatePicker, DateValidationT, useDatepicker } from '@navikt/ds-react';
import { UseDatepickerOptions } from '@navikt/ds-react/esm/date/hooks/useDatepicker';
import { dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode, useCallback, useEffect } from 'react';
import { useComponentUtils } from '../../context/component/componentUtilsContext';

interface NavDatePickerProps {
  id: string;
  required?: boolean;
  onChange: (val: string) => void;
  onValidate?: (errorMessage?: string) => void;
  value: string;
  readOnly?: boolean;
  error?: string;
  inputRef?: any;
  label: string;
  labelText: string;
  description?: ReactNode;
  className?: string;
  fromDate?: Date;
  toDate?: Date;
  defaultMonth?: Date;
}

const DatePicker = ({
  id,
  required,
  onChange,
  onValidate,
  value,
  readOnly,
  error,
  inputRef,
  label,
  labelText,
  description,
  className,
  fromDate,
  toDate,
  defaultMonth,
}: NavDatePickerProps) => {
  const { translate, locale } = useComponentUtils();

  const { datepickerProps, inputProps, setSelected, reset } = useDatepicker({
    required: required,
    onValidate: (dateValidation) => {
      validate(dateValidation);
    },
    onDateChange: (val) => {
      onChange(val ? dateUtils.toSubmissionDate(val) : '');
    },
    toDate: toDate,
    fromDate: fromDate,
    defaultMonth: defaultMonth,
    allowTwoDigitYear: false,
  } as UseDatepickerOptions);

  const validate = useCallback(
    (dateValidation?: DateValidationT) => {
      console.log(dateValidation);
      if (onValidate) {
        if (required && (!dateValidation || dateValidation.isEmpty)) {
          onValidate(translate('required', { field: labelText }));
        } else if (dateValidation && !dateValidation?.isEmpty) {
          if (dateValidation?.isValidDate) {
            onValidate(undefined);
          } else if (dateValidation?.isBefore && fromDate) {
            onValidate(
              translate('minDate', {
                field: labelText,
                minDate: dateUtils.toLocaleDate(fromDate),
              }),
            );
          } else if (dateValidation?.isAfter && toDate) {
            onValidate(translate('maxDate', { field: labelText, maxDate: dateUtils.toLocaleDate(toDate) }));
          } else {
            onValidate(translate('invalid_date', { field: labelText }));
          }
        } else {
          onValidate(undefined);
        }
      }
    },
    [required],
  );

  useEffect(() => {
    validate();
  }, [validate]);

  useEffect(() => {
    if (value) {
      setSelected(new Date(value));
    } else {
      reset();
    }
  }, [value]);

  return (
    <AkselDatePicker
      mode="single"
      selected={value ? new Date(value) : (undefined as any)}
      locale={locale as any}
      {...datepickerProps}
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
      />
    </AkselDatePicker>
  );
};

export default DatePicker;
