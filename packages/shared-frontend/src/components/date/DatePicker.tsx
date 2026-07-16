import { DatePicker as AkselDatePicker, useDatepicker } from '@navikt/ds-react';
import { dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { ChangeEvent, useEffect } from 'react';
import { useLanguage } from '../../context/language/LanguageContext';
import { useStateField } from '../../context/state/useStateField';
import { inputId } from '../../utils/inputId';
import ReadMore from '../read-more/ReadMore';
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
  readMore,
  marginBottom,
}: DatePickerProps) => {
  const { currentLanguage } = useLanguage();
  const { stateValue, error, setStateValue } = useStateField({ statePath });
  const displayValue = toDatePickerInputValue(stateValue);

  const { datepickerProps, inputProps, setSelected, reset } = useDatepicker({
    locale: getAkselLocale(currentLanguage),
    inputFormat: dateUtils.inputFormat,
    defaultSelected: toSelectedDate(stateValue),
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
    if (inputProps.value !== displayValue) {
      if (typeof stateValue === 'string' && stateValue !== '' && dateUtils.isValid(stateValue, 'submission')) {
        setSelected(dateUtils.toJSDate(stateValue));
      } else if (stateValue === '') {
        reset();
      }
    }
  }, [displayValue, inputProps.value, reset, setSelected, stateValue]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    inputProps.onChange?.(event);
    const nextValue = event.target.value;
    setStateValue(dateUtils.isValid(nextValue, 'input') ? dateUtils.toSubmissionDate(nextValue) : nextValue);
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
          value={displayValue}
          onChange={handleChange}
          onBlur={(event) => {
            if (event.target.value === '') {
              setStateValue('');
            } else if (dateUtils.isValid(event.target.value, 'input')) {
              setStateValue(dateUtils.toSubmissionDate(event.target.value));
            }
          }}
        />
      </AkselDatePicker>
      {readMore && <ReadMore {...readMore} />}
    </FormElementBox>
  );
};

export default DatePicker;
export type { DatePickerProps };
