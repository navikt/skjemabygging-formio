import { MonthPicker as AkselMonthPicker, useMonthpicker } from '@navikt/ds-react';
import { dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { ChangeEvent } from 'react';
import { useLanguage } from '../../context/language/LanguageContext';
import { useFieldBinding } from '../../context/state/useFieldBinding';
import { inputId } from '../../utils/inputId';
import ReadMore from '../read-more/ReadMore';
import styles from '../shared/FieldControl.module.css';
import FormElementBox from '../shared/FormElementBox';
import TranslatedDescription from '../shared/TranslatedDescription';
import TranslatedLabel from '../shared/TranslatedLabel';
import { BaseFieldProps, MonthPickerValidation } from '../types';
import { getAkselLocale, getMonthLocale } from './dateFieldUtils';
import { toMonthPickerValidation } from './dateValidation';

interface MonthPickerProps extends BaseFieldProps {
  label: string;
  minYear?: number;
  maxYear?: number;
  validation?: MonthPickerValidation;
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
  validation,
}: MonthPickerProps) => {
  const { currentLanguage } = useLanguage();
  const { stateValue, error, setStateValue } = useFieldBinding({
    statePath,
    validation: toMonthPickerValidation({ statePath, label, required, validation, minYear, maxYear }),
  });
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
      <AkselMonthPicker
        {...monthpickerProps}
        dropdownCaption={!!(minYear && maxYear)}
        wrapperClassName={styles.pickerRoot}
      >
        <AkselMonthPicker.Input
          {...inputProps}
          className={styles.picker}
          id={inputId(statePath)}
          label={<TranslatedLabel required={required} readOnly={readOnly} translationKey={label} />}
          description={description ? <TranslatedDescription translationKey={description} /> : undefined}
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
