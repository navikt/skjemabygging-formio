import { MonthPicker, useMonthpicker } from '@navikt/ds-react';
import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { ChangeEvent, useEffect } from 'react';
import { useLanguage } from '../../../context/language/LanguageContext';
import InputBox from '../../input/InputBox';
import TranslatedDescription from '../../input/TranslatedDescription';
import TranslatedLabel from '../../input/TranslatedLabel';
import { inputId } from '../../input/inputId';
import { useSubmissionField } from '../../input/useSubmissionField';
import {
  getAkselLocale,
  getMonthPickerMaxYear,
  getMonthPickerMinYear,
  toMonthPickerInputValue,
  toSelectedMonth,
} from '../date/dateFieldUtils';

interface InputMonthPickerProps {
  component: Component;
  pageKey: string;
  pageComponents: Component[];
  submissionPath: string;
}

const InputMonthPicker = ({ component, pageKey, pageComponents, submissionPath }: InputMonthPickerProps) => {
  const { currentLanguage } = useLanguage();
  const { submissionValue, error, setSubmissionValue } = useSubmissionField({
    pageKey,
    pageComponents,
    submissionPath,
  });

  const selectedMonth = toSelectedMonth(submissionValue);
  const minYear = getMonthPickerMinYear(component);
  const maxYear = getMonthPickerMaxYear(component);

  const { monthpickerProps, inputProps, setSelected } = useMonthpicker({
    locale: getAkselLocale(currentLanguage),
    defaultSelected: selectedMonth,
    fromDate: minYear ? new Date(minYear, 0, 1) : undefined,
    toDate: maxYear ? new Date(maxYear, 11, 31) : undefined,
    onMonthChange: (date) => {
      setSubmissionValue(date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` : '');
    },
  });

  useEffect(() => {
    setSelected(selectedMonth);
  }, [selectedMonth, setSelected]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    inputProps.onChange?.(event);
    setSubmissionValue(event.target.value);
  };

  return (
    <InputBox>
      <MonthPicker {...monthpickerProps}>
        <MonthPicker.Input
          {...inputProps}
          id={inputId(submissionPath)}
          label={
            <TranslatedLabel required={component.validate?.required} readOnly={component.readOnly}>
              {component.label}
            </TranslatedLabel>
          }
          description={<TranslatedDescription>{component.description}</TranslatedDescription>}
          error={error}
          readOnly={component.readOnly}
          value={toMonthPickerInputValue(submissionValue, currentLanguage)}
          onChange={handleChange}
        />
      </MonthPicker>
    </InputBox>
  );
};

export default InputMonthPicker;
