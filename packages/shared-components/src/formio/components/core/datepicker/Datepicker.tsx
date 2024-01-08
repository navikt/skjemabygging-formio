import { DatePicker, DatePickerProps, useDatepicker } from '@navikt/ds-react';
import { UseDatepickerOptions } from '@navikt/ds-react/esm/date/hooks/useDatepicker';

import moment from 'moment';
import { useEffect } from 'react';
import FormioReactComponent from '../../FormioReactComponent';
import BaseComponent from '../../base/BaseComponent';
import datepickerBuilder from './Datepicker.builder';
import datepickerForm from './Datepicker.form';
import { validate, validateBackwardsCompatible } from './utils/validation';

const SUBMISSION_DATE_FORMAT = 'YYYY-MM-DD';

const DatovelgerWrapper = ({ component, onChange, value, locale, readOnly, error, inputRef }) => {
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
        error={error}
        {...inputProps}
        ref={inputRef}
        hideLabel
      />
    </DatePicker>
  );
};

export default class NavDatepicker extends BaseComponent {
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

  validateDatePicker(
    input,
    submissionData,
    beforeDateInputKey,
    mayBeEqual,
    relativeEarliestAllowedDate,
    relativeLatestAllowedDate,
    row,
  ) {
    return validateBackwardsCompatible(
      input,
      submissionData,
      beforeDateInputKey,
      mayBeEqual,
      relativeEarliestAllowedDate,
      relativeLatestAllowedDate,
      row,
      this.t,
    );
  }

  validateDatePickerV2(input, submissionData, component, row) {
    return validate(input, submissionData, component, row, this.t);
  }

  setValueOnReactInstance(_value) {}

  renderReact(element) {
    return element.render(
      <DatovelgerWrapper
        component={this.component} // These are the component settings if you want to use them to render the component.
        value={this.dataForSetting || this.dataValue} // The starting value of the component.
        onChange={this.updateValue} // The onChange event to call when the value changes.
        locale={this.root.i18next.language}
        readOnly={this.options.readOnly}
        error={this.getError()}
        inputRef={(ref) => this.setReactInstance(ref)}
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
