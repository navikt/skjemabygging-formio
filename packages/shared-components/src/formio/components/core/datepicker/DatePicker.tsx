import { Component, dateUtils, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import FormioUtils from 'formiojs/utils';
import ReactDatePicker from '../../../../components/datepicker/DatePicker';
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

  setValueOnReactInstance(_value) {}

  getComponentsWithDateInputKey() {
    return navFormUtils
      .flattenComponents(this.root.getComponents() as Component[])
      .filter(
        (component) =>
          component.type === 'navDatepicker' && component.component?.beforeDateInputKey === this.component?.key,
      );
  }

  onValidate(errorMessage?: string) {
    this.removeAllErrors();
    if (errorMessage) {
      this.addError(errorMessage);
    }

    this.setComponentValidity(this.componentErrors, this.dirty, !this.root.submitted);
    this.root.showErrors();
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

  checkComponentValidity(data, dirty, row, options = {}) {
    // @ts-ignore
    this.setComponentValidity(this.componentErrors, dirty, !!options?.fromBlur);

    return this.componentErrors.length === 0;
  }

  getFromDate() {
    if (this.component?.beforeDateInputKey) {
      return FormioUtils.getValue(this.root.submission, this.component?.beforeDateInputKey);
    } else if (this.component?.earliestAllowedDate && !Number.isNaN(+this.component?.earliestAllowedDate)) {
      return dateUtils.addDays(+this.component?.earliestAllowedDate);
    } else if (this.component?.specificEarliestAllowedDate) {
      return new Date(this.component?.specificEarliestAllowedDate);
    }
  }

  getToDate() {
    const lowestReferencedDate = dateUtils.min(
      this.getComponentsWithDateInputKey()
        .map((component) => component.getValue?.() ?? '')
        .filter(Boolean),
    );
    if (lowestReferencedDate) {
      return lowestReferencedDate;
    } else if (this.component?.latestAllowedDate && !Number.isNaN(+this.component?.latestAllowedDate)) {
      return dateUtils.addDays(+this.component?.latestAllowedDate);
    } else if (this.component?.specificLatestAllowedDate) {
      return new Date(this.component?.specificLatestAllowedDate);
    }
  }

  renderReact(element) {
    return element.render(
      <ComponentUtilsProvider component={this}>
        <ReactDatePicker
          id={this.getId()}
          required={this.isRequired()}
          value={this.getDefaultValue()}
          onChange={this.onUpdate.bind(this)}
          onValidate={this.onValidate.bind(this)}
          readOnly={this.getReadOnly()}
          error={this.getError()}
          inputRef={(ref) => this.setReactInstance(ref)}
          description={this.getDescription()}
          label={this.getLabel()}
          labelText={this.getLabel({ labelTextOnly: true })}
          fromDate={this.getFromDate()}
          toDate={this.getToDate()}
        />
      </ComponentUtilsProvider>,
    );
  }
}
