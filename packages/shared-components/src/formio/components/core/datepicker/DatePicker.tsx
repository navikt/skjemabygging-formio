import ReactDatePicker from '../../../../components/datepicker/DatePicker';
import FormioReactComponent from '../../FormioReactComponent';
import BaseComponent from '../../base/BaseComponent';
import datePickerBuilder from './DatePicker.builder';
import datePickerForm from './DatePicker.form';
import { validate, validateBackwardsCompatible } from './utils/validation';

export default class DatePicker extends BaseComponent {
  isValid = this.errors.length === 0;

  static schema() {
    return FormioReactComponent.schema({
      type: 'navDatepicker',
      label: 'Dato (dd.mm.åååå)',
      dataGridLabel: true,
    });
  }

  static editForm() {
    return datePickerForm();
  }

  static get builderInfo() {
    return datePickerBuilder();
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
      this.t.bind(this),
    );
  }

  validateDatePickerV2(input, submissionData, component, row) {
    return validate(input, submissionData, component, row, this.t.bind(this));
  }

  setValueOnReactInstance(_value) {}

  renderReact(element) {
    return element.render(
      <ReactDatePicker
        id={this.getId()}
        isRequired={this.getIsRequired()}
        value={this.getDefaultValue()} // The starting value of the component.
        onChange={this.updateValue} // The onChange event to call when the value changes.
        locale={this.getLocale()}
        readOnly={this.getReadOnly()}
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
