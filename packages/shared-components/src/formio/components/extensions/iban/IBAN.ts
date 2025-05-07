import { FocusEventHandler } from 'react';
import BaseComponent from '../../base/BaseComponent';
import TextField from '../../core/textfield/TextField';
import IBANBuilder from './IBAN.builder';
import ibanForm from './IBAN.form';
import { validateIBAN } from './IBANValidator';

class IBAN extends TextField {
  private originalValue: string | null = null;

  static schema() {
    return BaseComponent.schema({
      label: 'IBAN',
      type: 'iban',
      key: `iban`,
      fieldSize: 'input--l',
      spellcheck: false,
    });
  }

  static editForm() {
    return ibanForm();
  }

  static get builderInfo() {
    return IBANBuilder();
  }

  get defaultSchema() {
    return IBAN.schema();
  }

  checkComponentValidity(data, dirty, row, options = {}) {
    const validity = super.checkComponentValidity(data, dirty, row, options);

    if (validity) {
      const errorMessage = validateIBAN(this.getValue(), this.translate.bind(this));
      return this.setComponentValidity(
        errorMessage ? [this.createError(errorMessage, undefined)] : [],
        dirty,
        undefined,
      );
    }
    return validity;
  }

  /**
   * @deprecated Validation has been moved. We keep this to support schemas that contains a reference to the function
   */
  validateIban(_inputValue) {
    return true;
  }

  onBlur(): FocusEventHandler<HTMLInputElement> {
    return (event: React.FocusEvent<HTMLInputElement>) => {
      const value = event.target.value;
      if (value) {
        this.originalValue = value;
        const formattedValue = this.formatIBAN(value);
        this.setValue(formattedValue);
      }
    };
  }

  onFocus(): FocusEventHandler<HTMLInputElement> {
    return (event: React.FocusEvent<HTMLInputElement>) => {
      const value = event.target.value;
      if (value) {
        this.originalValue = value;
        this.setValue(value);
      }
    };
  }

  formatIBAN(value: string): string {
    return value.replace(/(.{4})/g, '$1 ').trim();
  }

  getValue() {
    return this.originalValue ?? super.getValue();
  }
}

export default IBAN;
