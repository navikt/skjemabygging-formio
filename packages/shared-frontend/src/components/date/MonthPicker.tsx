import { MonthPicker as AkselMonthPicker, useMonthpicker } from '@navikt/ds-react';
import { dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { ChangeEvent } from 'react';
import { useLanguage } from '../../context/language/LanguageContext';
import { useStateField } from '../../context/state/useStateField';
import { inputId } from '../../utils/inputId';
import ReadMore from '../read-more/ReadMore';
import FormElementBox from '../shared/FormElementBox';
import TranslatedDescription from '../shared/TranslatedDescription';
import TranslatedLabel from '../shared/TranslatedLabel';
import { BaseFieldProps } from '../types';
import { getAkselLocale, getMonthLocale } from './dateFieldUtils';

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
  readMore,
  fieldSize,
  marginBottom,
}: MonthPickerProps) => {
  const { currentLanguage } = useLanguage();
  const { stateValue, error, setStateValue } = useStateField({ statePath });
  const locale = getMonthLocale(currentLanguage);

  const { monthpickerProps, inputProps } = useMonthpicker({
    locale: getAkselLocale(currentLanguage),
    fromDate: dateUtils.startOfYear(`${minYear ?? '1900'}`)?.toJSDate(),
    toDate: dateUtils.endOfYear(`${maxYear ?? '2100'}`)?.toJSDate(),
    allowTwoDigitYear: false,
    defaultYear:
      typeof stateValue === 'string' && dateUtils.isValidMonthSubmission(stateValue)
        ? dateUtils.toJSDateFromMonthSubmission(stateValue)
        : dateUtils.getDefaultDateFromRange(minYear?.toString(), maxYear?.toString()),
    onMonthChange: (date) => {
      setStateValue(dateUtils.toSubmissionDateMonth(date?.toISOString()));
    },
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    if (dateUtils.isValidInputMonth(inputValue, locale)) {
      setStateValue(dateUtils.toSubmissionDateMonth(inputValue, locale));
    } else {
      setStateValue(inputValue);
    }
  };

  return (
    <FormElementBox fieldSize={fieldSize} marginBottom={marginBottom}>
      <AkselMonthPicker {...monthpickerProps} dropdownCaption={!!(minYear && maxYear)}>
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
          value={
            typeof stateValue === 'string' && dateUtils.isValidMonthSubmission(stateValue)
              ? dateUtils.toLongMonthFormat(stateValue, locale)
              : typeof stateValue === 'string'
                ? stateValue
                : ''
          }
          onChange={handleChange}
        />
      </AkselMonthPicker>
      {readMore && <ReadMore {...readMore} />}
    </FormElementBox>
  );
};

export default MonthPicker;
export type { MonthPickerProps };
