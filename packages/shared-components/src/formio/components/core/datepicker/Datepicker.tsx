import { DatePicker, DatePickerProps, useDatepicker } from '@navikt/ds-react';
import { UseDatepickerOptions } from '@navikt/ds-react/esm/date/hooks/useDatepicker';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

import moment from 'moment';
import { useEffect } from 'react';
import FormioReactComponent from '../../FormioReactComponent';
import datepickerBuilder from './Datepicker.builder';
import datepickerForm from './Datepicker.form';

const SUBMISSION_DATE_FORMAT = 'YYYY-MM-DD';

const DatovelgerWrapper = ({ component, onChange, value, locale, readOnly, inputRef }) => {
  // @ts-ignore
  const { datepickerProps, inputProps, setSelected, reset }: DatePickerProps = useDatepicker({
    required: component.validate.required,
    onDateChange: (val) => {
      onChange(val ? moment(val).format(SUBMISSION_DATE_FORMAT) : '');
    },
  } as UseDatepickerOptions);

  useEffect(() => {
    if (value) {
      setSelected(moment(value, SUBMISSION_DATE_FORMAT).toDate());
    } else {
      reset();
    }
  }, [value]);

  return (
    <DatePicker
      id={component.id}
      selected={value ? moment(value, SUBMISSION_DATE_FORMAT).toDate() : undefined}
      locale={locale}
      {...datepickerProps}
    >
      <DatePicker.Input
        id={`${component.id}-${component.key}`}
        readOnly={readOnly}
        {...inputProps}
        ref={inputRef}
        hideLabel
      />
    </DatePicker>
  );
};

function isCorrectOrder(beforeDate, afterDate, mayBeEqual = false) {
  return mayBeEqual ? beforeDate.isSameOrBefore(afterDate, 'd') : beforeDate.isBefore(afterDate, 'd');
}

export default class NavDatepicker extends FormioReactComponent {
  isValid = this.errors.length === 0;

  static schema() {
    return FormioReactComponent.schema({
      type: 'navDatepicker',
      label: 'Dato (dd.mm.åååå)',
      dataGridLabel: true,
    });
  }

  static editForm() {
    return datepickerForm();
  }

  static get builderInfo() {
    return datepickerBuilder();
  }

  showNorwegianOrTranslation(key, params?) {
    if (params) {
      return this.t(key) === key ? this.t(TEXTS.validering[key], params) : this.t(key, params);
    }
    return this.t(key) === key ? TEXTS.validering[key] : this.t(key);
  }

  validateToAndFromDate(beforeDate, inputDate, mayBeEqual) {
    if (isCorrectOrder(beforeDate, inputDate, mayBeEqual)) {
      return true;
    }
    const beforeDateAsString = beforeDate.format('DD.MM.YYYY');
    return mayBeEqual
      ? this.showNorwegianOrTranslation('dateNotBeforeFromDate', { fromDate: beforeDateAsString })
      : this.showNorwegianOrTranslation('dateAfterFromDate', { fromDate: beforeDateAsString });
  }

  validateEarliestAndLatestDate(earliestFromToday = '', latestFromToday = '', inputDate) {
    const earliestAllowedDate = !!String(earliestFromToday) ? moment().add(String(earliestFromToday), 'd') : undefined;
    const latestAllowedDate = !!String(latestFromToday) ? moment().add(String(latestFromToday), 'd') : undefined;
    return this.validateEarliestAndLatest(earliestAllowedDate, latestAllowedDate, inputDate);
  }

  validateEarliestAndLatest(earliestAllowedDate, latestAllowedDate, inputDate) {
    const earliestAllowedDateAsString = earliestAllowedDate ? earliestAllowedDate.format('DD.MM.YYYY') : '';
    const latestAllowedDateAsString = latestAllowedDate ? latestAllowedDate.format('DD.MM.YYYY') : '';
    if (earliestAllowedDate && latestAllowedDate) {
      if (!isCorrectOrder(earliestAllowedDate, latestAllowedDate, true)) {
        return true;
      }
      return inputDate.isBefore(earliestAllowedDate, 'd') || inputDate.isAfter(latestAllowedDate, 'd')
        ? `${this.showNorwegianOrTranslation('dateInBetween', {
            minDate: earliestAllowedDateAsString,
            maxDate: latestAllowedDateAsString,
          })}`
        : true;
    }

    if (earliestAllowedDate && inputDate.isBefore(earliestAllowedDate, 'd')) {
      return `${this.showNorwegianOrTranslation('dateNotBeforeAllowedDate')} ${earliestAllowedDateAsString}`;
    }

    if (latestAllowedDate && inputDate.isAfter(latestAllowedDate, 'd')) {
      return `${this.showNorwegianOrTranslation('dateNotLaterThanAllowedDate')} ${latestAllowedDateAsString}`;
    }

    return true;
  }

  validateDatePicker(
    input,
    submissionData,
    beforeDateInputKey,
    mayBeEqual,
    relativeEarliestAllowedDate = '',
    relativeLatestAllowedDate = '',
    row,
  ) {
    if (!input) {
      return true;
    }

    let toAndFromDateValidation = true;
    if (beforeDateInputKey) {
      const beforeDateValue =
        submissionData[beforeDateInputKey] ||
        (beforeDateInputKey.includes('.') && row && row[beforeDateInputKey.replace(/.*\./i, '')]);
      if (beforeDateValue) {
        toAndFromDateValidation = this.validateToAndFromDate(moment(beforeDateValue), moment(input), mayBeEqual);
      }
    }

    const earliestFromToday = String(relativeEarliestAllowedDate);
    const latestFromToday = String(relativeLatestAllowedDate);

    const earliestAndLatestDateValidation =
      !!earliestFromToday || !!latestFromToday
        ? this.validateEarliestAndLatestDate(earliestFromToday, latestFromToday, moment(input))
        : true;

    if (typeof toAndFromDateValidation === 'string') {
      return toAndFromDateValidation;
    }
    if (typeof earliestAndLatestDateValidation === 'string') {
      return earliestAndLatestDateValidation;
    }
    return true;
  }

  validateDatePickerV2(input, submissionData, component, row) {
    if (!input) {
      return true;
    }

    const result = this.validateDatePicker(
      input,
      submissionData,
      component.beforeDateInputKey,
      component.mayBeEqual,
      component.earliestAllowedDate,
      component.latestAllowedDate,
      row,
    );
    if (result === true) {
      const { specificEarliestAllowedDate, specificLatestAllowedDate } = component;

      const earliest = specificEarliestAllowedDate ? moment(specificEarliestAllowedDate) : undefined;
      const latest = specificLatestAllowedDate ? moment(specificLatestAllowedDate) : undefined;
      return this.validateEarliestAndLatest(earliest, latest, moment(input));
    }
    return result;
  }

  renderReact(element) {
    return element.render(
      <DatovelgerWrapper
        component={this.component} // These are the component settings if you want to use them to render the component.
        value={this.dataForSetting || this.dataValue} // The starting value of the component.
        onChange={this.updateValue} // The onChange event to call when the value changes.
        locale={this.root.i18next.language}
        readOnly={this.options.readOnly}
        inputRef={(r) => (this.input = r)}
      />,
    );
  }

  checkValidity(data, dirty, rowData) {
    const isValid = super.checkValidity(data, dirty, rowData);
    this.componentIsValid(isValid);

    if (!isValid) {
      return false;
    }
    return this.validate(data, dirty, rowData);
  }

  componentIsValid = (isValid) => {
    if (isValid !== this.isValid) {
      this.isValid = !this.isValid;
    }
  };
}
