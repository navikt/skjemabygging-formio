import {
  formatNumber,
  InputMode,
  numberUtils,
  removeAllSpaces,
  removeAllSpacesAndCommas,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import { FocusEventHandler } from 'react';
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

  getNumberFormatOptions(): Intl.NumberFormatOptions {
    return { maximumFractionDigits: 2 };
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
    if (this.component?.calculateValue) {
      return true;
    }

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
    // Get data value instead of formatted number from this.getValue()
    const value = this.getDataValue();

    if (value === '' || value === undefined) {
      return;
    }

    if (this.getInputMode() === 'decimal') {
      if (!numberUtils.isValidDecimal(value)) return this.translateWithLabel(TEXTS.validering.decimal);
    } else if (this.getInputMode() === 'numeric') {
      if (!numberUtils.isValidInteger(value)) return this.translateWithLabel(TEXTS.validering.integer);
    }

    if (!numberUtils.isBiggerOrEqualMin(value, this.getMinValue())) {
      return this.translateWithLabel(TEXTS.validering.min, {
        min: numberUtils.toLocaleString(this.getMinValue(), this.getNumberFormatOptions()),
      });
    }

    if (!numberUtils.isSmallerOrEqualMax(value, this.getMaxValue())) {
      return this.translateWithLabel(TEXTS.validering.max, {
        max: numberUtils.toLocaleString(this.getMaxValue(), this.getNumberFormatOptions()),
      });
    }
  }

  handleChange(value: string) {
    if (value !== undefined) {
      const dataValue = removeAllSpacesAndCommas(value);
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

  getDataValue() {
    // Get data value from parent instead of formatted number from this.getValue()
    return super.getValue();
  }

  override getValue() {
    // Need to format the number when jumping between tabs or else we show the data value instead of display value
    return numberUtils.toLocaleString(super.getValue(), this.getNumberFormatOptions());
  }

  setValueOnReactInstance(value) {
    // This is needed to handle formatting after calculate value
    super.setValueOnReactInstance(numberUtils.toLocaleString(value, this.getNumberFormatOptions()));
  }

  onBlur(): FocusEventHandler<HTMLInputElement> {
    const isInteger = this.getInputMode() === 'numeric';
    return (event: React.FocusEvent<HTMLInputElement>) => {
      const value = removeAllSpaces(event.currentTarget.value);

      if (value !== '') {
        super.setValueOnReactInstance(formatNumber(value, isInteger));
      }
    };
  }

  getDisplayValue(): string {
    return formatNumber(super.getDisplayValue(), this.getInputMode() === 'numeric');
  }
}

export default Number;
