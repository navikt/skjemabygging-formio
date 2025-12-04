import { dateUtils, numberUtils } from '@navikt/skjemadigitalisering-shared-domain';
import ReactDatePicker, { validateDate } from '../../../../components/datepicker/DatePicker';
import { ComponentUtilsProvider } from '../../../../context/component/componentUtilsContext';
import BaseComponent from '../../base/BaseComponent';
import AdditionalDescription from '../../base/components/AdditionalDescription';
import Description from '../../base/components/Description';
import Label from '../../base/components/Label';
import datePickerBuilder from './DatePicker.builder';
import datePickerForm from './DatePicker.form';
import { getBeforeDateInputValue, getComponentsWithDateInputKey } from './DatePicker.utils';

export default class DatePicker extends BaseComponent {
  static schema() {
    return BaseComponent.schema({
      type: 'navDatepicker',
      label: 'Dato (dd.mm.åååå)',
    });
  }

  static editForm() {
    return datePickerForm();
  }

  static get builderInfo() {
    return datePickerBuilder();
  }

  /**
   * @deprecated We need to keep this as long as form definitions use instance.validateDatePicker()
   */
  validateDatePicker() {
    return true;
  }

  /**
   * @deprecated We need to keep this as long as form definitions use instance.validateDatePickerV2()
   */
  validateDatePickerV2() {
    return true;
  }

  checkComponentValidity(data, dirty, row, _options = {}) {
    if (this.shouldSkipValidation(data, dirty, row)) {
      this.setCustomValidity('');
    } else {
      const errorMessage = validateDate(
        {
          required: this.isRequired(),
          value: this.getValue(),
          label: this.getLabel(),
          fromDate: this.getFromDate(),
          toDate: this.getToDate(),
        },
        this.translate.bind(this),
      );

      return this.setComponentValidity(
        errorMessage ? [this.createError(errorMessage, undefined)] : [],
        dirty,
        undefined,
      );
    }

    return true;
  }

  getFromDate(): string | undefined {
    if (this.component?.beforeDateInputKey) {
      const beforeDateInputValue = getBeforeDateInputValue(this);
      if (beforeDateInputValue) {
        if (this.component?.mayBeEqual) {
          return beforeDateInputValue;
        } else {
          return dateUtils.addDays(1, beforeDateInputValue);
        }
      }

      return undefined;
    } else if (
      this.component?.earliestAllowedDate !== undefined &&
      numberUtils.isValidInteger(this.component?.earliestAllowedDate)
    ) {
      return dateUtils.addDays(+this.component?.earliestAllowedDate);
    } else if (this.component?.specificEarliestAllowedDate) {
      return this.component?.specificEarliestAllowedDate;
    }
  }

  getToDate(): string | undefined {
    if (
      this.component?.latestAllowedDate !== undefined &&
      numberUtils.isValidInteger(this.component?.latestAllowedDate)
    ) {
      return dateUtils.addDays(+this.component?.latestAllowedDate);
    } else if (this.component?.specificLatestAllowedDate) {
      return this.component?.specificLatestAllowedDate;
    }
  }

  onUpdate(value: string) {
    this.handleChange(value);

    getComponentsWithDateInputKey(this).map((component) => component.rerender?.());
  }

  override renderReact(element) {
    return element.render(
      <ComponentUtilsProvider component={this}>
        <ReactDatePicker
          id={this.getId()}
          label={<Label component={this.component} parent={this.parent} editFields={this.getEditFields()} />}
          required={this.isRequired()}
          value={this.getValue()}
          onChange={this.onUpdate.bind(this)}
          readOnly={this.getReadOnly()}
          error={this.getError()}
          inputRef={(ref) => this.setReactInstance(ref)}
          description={<Description component={this.component} />}
          fromDate={this.getFromDate()}
          toDate={this.getToDate()}
        />
        <AdditionalDescription component={this.component} />
      </ComponentUtilsProvider>,
    );
  }
}
