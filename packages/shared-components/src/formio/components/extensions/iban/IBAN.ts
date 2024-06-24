import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import * as ibantools from 'ibantools';
import BaseComponent from '../../base/BaseComponent';
import TextField from '../../core/textfield/TextField';
import IBANBuilder from './IBAN.builder';
import ibanForm from './IBAN.form';

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

  getErrorMessage(key) {
    // @ts-ignore
    return this.translate(key) === key ? TEXTS.validering[key] : this.translate(key);
  }

  validateIban(iban) {
    const { validateIBAN, ValidationErrorsIBAN } = ibantools;
    const { valid, errorCodes } = validateIBAN(iban);
    if (valid || errorCodes.includes(ValidationErrorsIBAN.NoIBANProvided)) {
      return true;
    }

    if (errorCodes.includes(ValidationErrorsIBAN.WrongBBANLength)) return this.getErrorMessage('wrongBBANLength');
    if (errorCodes.includes(ValidationErrorsIBAN.NoIBANCountry)) return this.getErrorMessage('noIBANCountry');

    return this.getErrorMessage('invalidIBAN');
  }
}

export default IBAN;
