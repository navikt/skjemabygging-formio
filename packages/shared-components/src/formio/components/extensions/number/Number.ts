import { InputMode, numberUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import BaseComponent from '../../base/BaseComponent';
import TextField from '../../core/textfield/TextField';
import numberBuilder from './Number.builder';
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

  static get builderInfo() {
    return numberBuilder();
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
    // Get data value from parent instead of formatted number from this.getValue()
    const value = super.getValue();

    if (value === '' || value === undefined) {
      return;
    }

    if (this.getInputMode() === 'decimal') {
      if (!numberUtils.isValidDecimal(value)) return this.translateWithLabel(TEXTS.validering.decimal);
    } else if (this.getInputMode() === 'numeric') {
      if (!numberUtils.isValidInteger(value)) return this.translateWithLabel(TEXTS.validering.integer);
    }

    if (!numberUtils.isBiggerOrEqualMin(value, this.getMinValue())) {
      return this.translateWithLabel(TEXTS.validering.min, { min: numberUtils.toLocaleString(this.getMinValue()) });
    }

    if (!numberUtils.isSmallerOrEqualMax(value, this.getMaxValue())) {
      return this.translateWithLabel(TEXTS.validering.max, { max: numberUtils.toLocaleString(this.getMaxValue()) });
    }
  }

  translateWithLabel(key: string, options = {}) {
    return this.t(key, { field: this.getLabel({ labelTextOnly: true }), ...options });
  }

  handleChange(value: string) {
    if (value !== undefined) {
      const dataValue = this.replaceCommasAndSpaces(value);
      if (
        (this.getInputMode() === 'decimal' && numberUtils.isValidDecimal(dataValue)) ||
        (this.getInputMode() === 'numeric' && numberUtils.isValidInteger(dataValue))
      ) {
        return super.handleChange(parseFloat(dataValue));
      } else {
        return super.handleChange(dataValue);
      }
    }
  }

  getValue() {
    // Need to format the number when jumping between tabs or else we show the data value instead of display value
    return numberUtils.toLocaleString(super.getValue());
  }

  replaceCommasAndSpaces(value: string) {
    return value?.replace(/,/g, '.').replace(/\s/g, '');
  }
}

export default Number;
