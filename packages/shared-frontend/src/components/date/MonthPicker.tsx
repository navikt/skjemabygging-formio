import { MonthPicker as AkselMonthPicker, useMonthpicker } from '@navikt/ds-react';
import { ChangeEvent, useEffect } from 'react';
import { useLanguage } from '../../context/language/LanguageContext';
import { useStateField } from '../../context/state/useStateField';
import { inputId } from '../../utils/inputId';
import InputBox from '../input/InputBox';
import TranslatedDescription from '../input/TranslatedDescription';
import TranslatedLabel from '../input/TranslatedLabel';
import { BaseFieldProps } from '../types';
import { getAkselLocale, toMonthPickerInputValue, toSelectedMonth } from './dateFieldUtils';

interface MonthPickerProps extends BaseFieldProps {
  label: string;
  minYear?: number;
  maxYear?: number;
}

const MonthPicker = ({
  statePath,
  label,
  description,
  required,
  readOnly,
  minYear,
  maxYear,
  marginBottom,
}: MonthPickerProps) => {
  const { currentLanguage } = useLanguage();
  const { stateValue, error, setStateValue } = useStateField({ statePath });
  const selectedMonth = toSelectedMonth(stateValue);

  const { monthpickerProps, inputProps, setSelected } = useMonthpicker({
    locale: getAkselLocale(currentLanguage),
    defaultSelected: selectedMonth,
    fromDate: minYear ? new Date(minYear, 0, 1) : undefined,
    toDate: maxYear ? new Date(maxYear, 11, 31) : undefined,
    onMonthChange: (date) => {
      setStateValue(date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` : '');
    },
  });

  useEffect(() => {
    setSelected(selectedMonth);
  }, [selectedMonth, setSelected]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    inputProps.onChange?.(event);
    setStateValue(event.target.value);
  };

  return (
    <InputBox marginBottom={marginBottom}>
      <AkselMonthPicker {...monthpickerProps}>
        <AkselMonthPicker.Input
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
          value={toMonthPickerInputValue(stateValue, currentLanguage)}
          onChange={handleChange}
        />
      </AkselMonthPicker>
    </InputBox>
  );
};

export default MonthPicker;
export type { MonthPickerProps };
