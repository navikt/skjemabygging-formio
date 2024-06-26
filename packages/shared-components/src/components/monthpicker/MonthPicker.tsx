import { MonthPicker as AkselMonthPicker, useMonthpicker } from '@navikt/ds-react';
import { dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useComponentUtils } from '../../context/component/componentUtilsContext';

interface MonthPickerProps {
  label: React.ReactNode;
  minYear?: number;
  maxYear?: number;
  required?: boolean;
  onChange: (val: string) => void;
  value?: string;
  error?: string;
  description?: React.ReactNode;
  inputRef: (ref: any) => void;
}

const MonthPicker = ({
  minYear,
  maxYear,
  required,
  onChange,
  value,
  error,
  label,
  description,
  inputRef,
}: MonthPickerProps) => {
  const { locale } = useComponentUtils();

  const { monthpickerProps, inputProps } = useMonthpicker({
    required: required,
    fromDate: dateUtils.startOfYear(`${minYear ?? '1900'}`)?.toJSDate(),
    toDate: dateUtils.endOfYear(`${maxYear ?? '2100'}`)?.toJSDate(),
    allowTwoDigitYear: false,
    defaultYear:
      value && dateUtils.isValidMonthSubmission(value) ? dateUtils.toJSDateFromMonthSubmission(value) : new Date(),
    onMonthChange(date) {
      onChange(dateUtils.toSubmissionDateMonth(date?.toISOString()));
    },
  });

  return (
    <AkselMonthPicker {...monthpickerProps} locale={locale} dropdownCaption={!!(minYear && maxYear)}>
      <AkselMonthPicker.Input
        label={label}
        {...inputProps}
        value={dateUtils.isValidMonthSubmission(value) ? dateUtils.toLongMonthFormat(value, locale) : value ?? ''}
        error={error}
        description={description}
        ref={inputRef}
        onChange={(e) => {
          const inputValue = e.target.value;
          const hasValidSubmissionInput = dateUtils.isValidInputMonth(inputValue, locale);
          if (hasValidSubmissionInput) {
            onChange(dateUtils.toSubmissionDateMonth(inputValue));
          } else {
            onChange(inputValue);
          }
        }}
      />
    </AkselMonthPicker>
  );
};

export default MonthPicker;
