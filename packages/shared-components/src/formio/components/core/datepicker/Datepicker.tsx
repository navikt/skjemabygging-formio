import ReactDatepicker from '../../../../components/datepicker/Datepicker';
import FormioReactComponent from '../../FormioReactComponent';
import BaseComponent from '../../base/BaseComponent';
import datepickerBuilder from './Datepicker.builder';
import datepickerForm from './Datepicker.form';
import { validate, validateBackwardsCompatible } from './utils/validation';

export default class Datepicker extends BaseComponent {
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
      this.t.bind(this),
    );
  }

  validateDatePickerV2(input, submissionData, component, row) {
    return validate(input, submissionData, component, row, this.t.bind(this));
  }

  setValueOnReactInstance(_value) {}

  renderReact(element) {
    return element.render(
      <ReactDatepicker
        id={this.component?.id}
        inputId={`${this.component?.id}-${this.component?.key}`}
        isRequired={this.component?.validate?.required}
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
