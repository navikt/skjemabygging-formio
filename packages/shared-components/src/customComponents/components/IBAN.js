import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import TextField from "formiojs/components/textfield/TextField";
import TextFieldEditForm from "formiojs/components/textfield/TextField.form";
import FormBuilderOptions from "../../Forms/form-builder-options";

export default class IBAN extends TextField {
  static schema(...extend) {
    return TextField.schema({
      ...FormBuilderOptions.builder.pengerOgKonto.components.iban.schema,
      ...extend,
    });
  }

  getErrorMessage(key) {
    return this.t(key) === key ? TEXTS.validering[key] : this.t(key);
  }

  validateIban(iban) {
    const { validateIBAN, ValidationErrorsIBAN } = require("ibantools");
    const { valid, errorCodes } = validateIBAN(iban);
    if (valid) {
      return true;
    }

    if (errorCodes.includes(ValidationErrorsIBAN.NoIBANProvided)) return this.getErrorMessage("noIBANProvided");
    if (errorCodes.includes(ValidationErrorsIBAN.WrongBBANLength)) return this.getErrorMessage("wrongBBANLength");
    if (errorCodes.includes(ValidationErrorsIBAN.NoIBANCountry)) return this.getErrorMessage("noIBANCountry");
    if (errorCodes.includes(ValidationErrorsIBAN.ChecksumNotNumber)) return this.getErrorMessage("checksumNotNumber");
    if (errorCodes.includes(ValidationErrorsIBAN.WrongIBANChecksum)) return this.getErrorMessage("wrongIBANChecksum");

    return this.getErrorMessage("invalidIBAN");
  }

  get defaultSchema() {
    return IBAN.schema();
  }

  static get builderInfo() {
    return FormBuilderOptions.builder.pengerOgKonto.components.iban;
  }

  static editForm(...extend) {
    return TextFieldEditForm(...extend);
  }
}
