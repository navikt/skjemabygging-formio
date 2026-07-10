import { DatePicker as AkselDatePicker, useDatepicker } from '@navikt/ds-react';
import { dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { ChangeEvent, useEffect } from 'react';
import { useLanguage } from '../../context/language/LanguageContext';
import { useStateField } from '../../context/state/useStateField';
import { inputId } from '../../utils/inputId';
import FormElementBox from '../shared/FormElementBox';
import TranslatedDescription from '../shared/TranslatedDescription';
import TranslatedLabel from '../shared/TranslatedLabel';
import { BaseFieldProps } from '../types';
import { getAkselLocale, toDatePickerInputValue, toSelectedDate } from './dateFieldUtils';

interface DatePickerProps extends BaseFieldProps {
  label: string;
  fromDate?: string;
  toDate?: string;
}

const DatePicker = ({
  statePath,
  label,
  description,
  required,
  readOnly,
  fromDate,
  toDate,
  marginBottom,
}: DatePickerProps) => {
  const { currentLanguage } = useLanguage();
  const { stateValue, error, setStateValue } = useStateField({ statePath });
  const selectedDate = toSelectedDate(stateValue);

  const { datepickerProps, inputProps, setSelected } = useDatepicker({
    locale: getAkselLocale(currentLanguage),
    inputFormat: dateUtils.inputFormat,
    defaultSelected: selectedDate,
    fromDate: fromDate ? dateUtils.toJSDate(fromDate) : undefined,
    toDate: toDate ? dateUtils.toJSDate(toDate) : undefined,
    onDateChange: (date) => {
      setStateValue(
        date
          ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
          : '',
      );
    },
  });

  useEffect(() => {
    setSelected(selectedDate);
  }, [selectedDate, setSelected]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    inputProps.onChange?.(event);
    setStateValue(event.target.value);
  };

  return (
    <FormElementBox marginBottom={marginBottom}>
      <AkselDatePicker {...datepickerProps}>
        <AkselDatePicker.Input
          {...inputProps}
          id={inputId(statePath)}
          label={
            <TranslatedLabel required={required} readOnly={readOnly}>
              {label}
            </TranslatedLabel>
          }
          description={<TranslatedDescription>{description}</TranslatedDescription>}
          error={error}
          readOnly={readOnly}
          value={toDatePickerInputValue(stateValue)}
          onChange={handleChange}
        />
      </AkselDatePicker>
    </FormElementBox>
  );
};

export default DatePicker;
export type { DatePickerProps };
