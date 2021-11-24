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

  validateIban(iban) {
    const { validateIBAN, ValidationErrorsIBAN } = require("ibantools");
    const { valid, errorCodes } = validateIBAN(iban);
    if (valid) {
      return true;
    }

    if (errorCodes.includes(ValidationErrorsIBAN.NoIBANProvided)) return "Gyldig IBAN er ikke oppgitt";
    if (errorCodes.includes(ValidationErrorsIBAN.WrongBBANLength)) return "Oppgitt IBAN har feil lengde.";
    if (errorCodes.includes(ValidationErrorsIBAN.NoIBANCountry))
      return "Oppgitt IBAN inneholder ugyldig landkode (to store bokstaver i starten av IBAN-koden)";
    if (errorCodes.includes(ValidationErrorsIBAN.ChecksumNotNumber))
      return "Oppgitt IBAN er ugyldig fordi sjekksummen ikke er et tall";
    if (errorCodes.includes(ValidationErrorsIBAN.WrongIBANChecksum))
      return "Oppgitt IBAN har ikke riktig sjekksum. Sjekk at du har tastet riktig.";

    return "Oppgitt IBAN er ugyldig. Sjekk at du har tastet riktig";
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
