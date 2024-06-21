import { MonthPicker as AkselMonthPicker, useMonthpicker } from '@navikt/ds-react';
import { dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useComponentUtils } from '../../context/component/componentUtilsContext';

interface MonthPickerProps {
  minYear?: number;
  maxYear?: number;
  required?: boolean;
  onChange: (val: string) => void;
  value?: string;
}

// TODO: Add amplitude test
const MonthPicker = ({ minYear, maxYear, required, onChange, value }: MonthPickerProps) => {
  const { locale } = useComponentUtils();

  const { monthpickerProps, inputProps } = useMonthpicker({
    required: required,
    fromDate: dateUtils.startOfYear(`${minYear ?? '1900'}`)?.toJSDate(),
    toDate: dateUtils.endOfYear(`${maxYear ?? '2100'}`)?.toJSDate(),
    allowTwoDigitYear: false,
    defaultYear: maxYear ? dateUtils.endOfYear(`${maxYear}`)?.toJSDate() : new Date(),
    onMonthChange(date) {
      onChange(dateUtils.toSubmissionDateMonth(date?.toISOString()));
    },
  });

  // TODO: Check for 4 digits in year (for dropdown caption)
  return (
    <AkselMonthPicker {...monthpickerProps} locale={locale} dropdownCaption={!!(minYear && maxYear)}>
      <AkselMonthPicker.Input
        label="Velg måned"
        {...inputProps}
        value={dateUtils.isValid(value, 'submission') ? dateUtils.toLongMonthFormat(value, locale) : value ?? ''}
        onChange={(e) => {
          console.log('halla');
          const inputValue = e.target.value;
          const hasValidSubmissionInput = dateUtils.isValidInputMonth(inputValue);
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
