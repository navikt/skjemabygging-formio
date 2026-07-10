import { DatePicker, useDatepicker } from '@navikt/ds-react';
import { Component, dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { ChangeEvent, useEffect } from 'react';
import { useLanguage } from '../../../context/language/LanguageContext';
import { useSubmissionState } from '../../../context/state/SubmissionStateContext';
import InputBox from '../../input/InputBox';
import TranslatedDescription from '../../input/TranslatedDescription';
import TranslatedLabel from '../../input/TranslatedLabel';
import { inputId } from '../../input/inputId';
import { useSubmissionField } from '../../input/useSubmissionField';
import {
  getAkselLocale,
  getDatePickerFromDate,
  getDatePickerToDate,
  toDatePickerInputValue,
  toSelectedDate,
} from '../date/dateFieldUtils';

interface InputDatePickerProps {
  component: Component;
  pageKey: string;
  pageComponents: Component[];
  submissionPath: string;
}

const InputDatePicker = ({ component, pageKey, pageComponents, submissionPath }: InputDatePickerProps) => {
  const { currentLanguage } = useLanguage();
  const { submission } = useSubmissionState();
  const { submissionValue, error, setSubmissionValue } = useSubmissionField({
    pageKey,
    pageComponents,
    submissionPath,
  });

  const selectedDate = toSelectedDate(submissionValue);
  const fromDate = getDatePickerFromDate(component, pageComponents, submission);
  const toDate = getDatePickerToDate(component);

  const { datepickerProps, inputProps, setSelected } = useDatepicker({
    locale: getAkselLocale(currentLanguage),
    inputFormat: dateUtils.inputFormat,
    defaultSelected: selectedDate,
    fromDate: fromDate ? dateUtils.toJSDate(fromDate) : undefined,
    toDate: toDate ? dateUtils.toJSDate(toDate) : undefined,
    onDateChange: (date) => {
      setSubmissionValue(
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
    setSubmissionValue(event.target.value);
  };

  return (
    <InputBox>
      <DatePicker {...datepickerProps}>
        <DatePicker.Input
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
          value={toDatePickerInputValue(submissionValue)}
          onChange={handleChange}
        />
      </DatePicker>
    </InputBox>
  );
};

export default InputDatePicker;
