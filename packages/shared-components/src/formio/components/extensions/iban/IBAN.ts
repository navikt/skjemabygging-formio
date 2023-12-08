import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import TextField from 'formiojs/components/textfield/TextField';
import * as ibantools from 'ibantools';
import FormBuilderOptions from '../../../form-builder-options';
import ibanForm from './IBAN.form';

class IBAN extends TextField {
  static schema(...extend) {
    return TextField.schema(
      {
        ...FormBuilderOptions.builder.pengerOgKonto.components.iban.schema,
      },
      ...extend,
    );
  }

  static editForm() {
    return ibanForm();
  }

  static get builderInfo() {
    return FormBuilderOptions.builder.pengerOgKonto.components.iban;
  }

  get defaultSchema() {
    return IBAN.schema();
  }

  getErrorMessage(key) {
    // @ts-ignore
    return this.t(key) === key ? TEXTS.validering[key] : this.t(key);
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
