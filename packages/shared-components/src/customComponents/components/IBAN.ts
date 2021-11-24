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
    const validationResult = validateIBAN(iban);
    if (validationResult.valid) {
      return true;
    }
    console.log("ValidationErrorsIBAN", ValidationErrorsIBAN);
    console.log("errors: ", validationResult.errorCodes);
    switch (validationResult.errorCodes[0]) {
      case ValidationErrorsIBAN.NoIBANProvided:
        return "Gyldig IBAN er ikke oppgitt";
      case ValidationErrorsIBAN.NoIBANCountry:
        return "Oppgitt IBAN mangler landkode (to bokstaver i starten av IBAN-koden)";
      case ValidationErrorsIBAN.ChecksumNotNumber:
        return "Oppgitt IBAN er ikke gyldig fordi sjekksummen ikke er et gyldig tall";
      case ValidationErrorsIBAN.WrongIBANChecksum:
        return "Oppgitt IBAN har ikke riktig sjekksum. Sjekk at du har tastet riktig.";
      case ValidationErrorsIBAN.WrongBBANLength:
        return "Oppgitt IBAN har feil lengde.";
      case ValidationErrorsIBAN.WrongBBANFormat:
      default:
        return "Oppgitt IBAN er ugyldig. Sjekk at du har tastet riktig";
    }
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
