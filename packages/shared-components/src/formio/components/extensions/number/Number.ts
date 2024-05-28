import { InputMode, numberUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import BaseComponent from '../../base/BaseComponent';
import TextField from '../../core/textfield/TextField';
import numberForm from './Number.form';

class Number extends TextField {
  static schema() {
    return BaseComponent.schema({
      label: 'Tall',
      type: 'number',
      key: 'tall',
      spellcheck: false,
      inputType: 'decimal',
    });
  }

  static editForm() {
    return numberForm();
  }

  getInputMode(): InputMode {
    return this.component?.inputType || 'decimal';
  }

  getMinValue() {
    return this.component?.validate?.min;
  }

  getMaxValue() {
    return this.component?.validate?.max;
  }

  checkComponentValidity(data, dirty, row, options = {}) {
    const validity = super.checkComponentValidity(data, dirty, row, options);

    if (validity) {
      const errorMessage = this.validateNumber();
      if (errorMessage) {
        return this.setComponentValidity([this.createError(errorMessage, undefined)], dirty, undefined);
      }
    }

    return validity;
  }

  validateNumber() {
    if (this.getValue() === undefined) {
      return;
    }

    if (this.getInputMode() === 'decimal') {
      if (!numberUtils.isValidDecimal(this.getValue())) return this.translateWithLabel(TEXTS.validering.decimal);
    } else if (this.getInputMode() === 'numeric') {
      if (!numberUtils.isValidInteger(this.getValue())) return this.translateWithLabel(TEXTS.validering.integer);
    }

    if (!numberUtils.isBiggerOrEqualMin(this.getValue(), this.getMinValue())) {
      return this.translateWithLabel(TEXTS.validering.min, { min: numberUtils.toLocaleString(this.getMinValue()) });
    }

    if (!numberUtils.isSmallerOrEqualMax(this.getValue(), this.getMaxValue())) {
      return this.translateWithLabel(TEXTS.validering.max, { max: numberUtils.toLocaleString(this.getMaxValue()) });
    }
  }

  translateWithLabel(key: string, options = {}) {
    return this.t(key, { field: this.getLabel({ labelTextOnly: true }), ...options });
  }

  handleChange(value: string): any {
    return super.handleChange(this.replaceCommasAndSpaces(value));
  }

  setValue(value: string): any {
    // Need to format the number if it is saved or if you come back from summary page.
    super.setValue(numberUtils.toLocaleString(value));
  }

  replaceCommasAndSpaces(value: string) {
    return value?.replace(/,/g, '.').replace(/\s/g, '');
  }
}

export default Number;
