import { Component, dateUtils, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import FormioUtils from 'formiojs/utils';
import ReactDatePicker, { validateDate } from '../../../../components/datepicker/DatePicker';
import { ComponentUtilsProvider } from '../../../../context/component/componentUtilsContext';
import BaseComponent from '../../base/BaseComponent';
import datePickerBuilder from './DatePicker.builder';
import datePickerForm from './DatePicker.form';

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

  //setValueOnReactInstance(_value) {}

  getComponentsWithDateInputKey() {
    return navFormUtils
      .flattenComponents(this.root.getComponents() as Component[])
      .filter(
        (component) =>
          component.type === 'navDatepicker' && component.component?.beforeDateInputKey === this.component?.key,
      );
  }

  checkComponentValidity(data, dirty, row, options = {}) {
    if (this.shouldSkipValidation(data, dirty, row)) {
      this.setCustomValidity('');
    } else {
      const errorMessage = validateDate(
        {
          required: this.isRequired(),
          value: this.getValue(),
          label: this.getLabel({ labelTextOnly: true }),
          fromDate: this.getFromDate(),
          toDate: this.getToDate(),
        },
        this.t.bind(this),
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
      const beforeDateValue = FormioUtils.getValue(this.root.submission, this.component?.beforeDateInputKey);
      if (beforeDateValue) {
        if (this.component?.mayBeEqual) {
          return beforeDateValue;
        } else {
          return dateUtils.addDays(1, beforeDateValue);
        }
      }

      return undefined;
    } else if (this.component?.earliestAllowedDate && !Number.isNaN(+this.component?.earliestAllowedDate)) {
      return dateUtils.addDays(+this.component?.earliestAllowedDate);
    } else if (this.component?.specificEarliestAllowedDate) {
      return this.component?.specificEarliestAllowedDate;
    }
  }

  getToDate(): string | undefined {
    if (this.component?.latestAllowedDate && !Number.isNaN(+this.component?.latestAllowedDate)) {
      return dateUtils.addDays(+this.component?.latestAllowedDate);
    } else if (this.component?.specificLatestAllowedDate) {
      return this.component?.specificLatestAllowedDate;
    }
  }

  onUpdate(value: string) {
    this.updateValue(value, { modified: true });

    if (this.component?.beforeDateInputKey) {
      const referenceComponent = navFormUtils.findByKey(this.component?.beforeDateInputKey, this.root.getComponents());
      referenceComponent?.rerender?.();
    } else {
      this.getComponentsWithDateInputKey().map((component) => component.rerender?.());
    }
  }

  override renderReact(element) {
    return element.render(
      <ComponentUtilsProvider component={this}>
        <ReactDatePicker
          id={this.getId()}
          required={this.isRequired()}
          value={this.getDefaultValue()}
          onChange={this.onUpdate.bind(this)}
          readOnly={this.getReadOnly()}
          error={this.getError()}
          inputRef={(ref) => this.setReactInstance(ref)}
          description={this.getDescription()}
          label={this.getLabel()}
          fromDate={this.getFromDate()}
          toDate={this.getToDate()}
        />
      </ComponentUtilsProvider>,
    );
  }
}
