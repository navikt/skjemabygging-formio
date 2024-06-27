import BaseComponent from '../../base/BaseComponent';
import TextField from '../../core/textfield/TextField';
import IBANBuilder from './IBAN.builder';
import ibanForm from './IBAN.form';
import { validateIBAN } from './IBANValidator';

class IBAN extends TextField {
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
    if (this.shouldSkipValidation(data, dirty, row)) {
      this.setCustomValidity('');
      return true;
    }

    const errorMessage = validateIBAN(
      {
        value: this.getValue(),
        label: this.getLabel({ labelTextOnly: true }),
        required: this.isRequired(),
      },
      this.translate.bind(this),
    );
    return this.setComponentValidity(errorMessage ? [this.createError(errorMessage, undefined)] : [], dirty, undefined);
  }

  validateIban(_iban) {
    return true;
  }
}

export default IBAN;
