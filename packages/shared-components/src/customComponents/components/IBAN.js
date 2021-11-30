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
    if (valid || errorCodes.includes(ValidationErrorsIBAN.NoIBANProvided)) {
      return true;
    }

    if (errorCodes.includes(ValidationErrorsIBAN.WrongBBANLength)) return this.getErrorMessage("wrongBBANLength");
    if (errorCodes.includes(ValidationErrorsIBAN.NoIBANCountry)) return this.getErrorMessage("noIBANCountry");

    return this.getErrorMessage("invalidIBAN");
  }

  get defaultSchema() {
    return IBAN.schema();
  }

  static get builderInfo() {
    return FormBuilderOptions.builder.pengerOgKonto.components.iban;
  }

  static editForm(...extend) {
    return TextFieldEditForm([
      {
        key: "display",
        components: [
          {
            key: "prefix",
            ignore: true,
          },
          {
            key: "suffix",
            ignore: true,
          },
          {
            key: "customClass",
            ignore: true,
          },
          {
            key: "hidden",
            ignore: true,
          },
          {
            key: "hideLabel",
            ignore: true,
          },
          {
            key: "showWordCount",
            ignore: true,
          },
          {
            key: "tableView",
            ignore: true,
          },
          {
            key: "modalEdit",
            ignore: true,
          },
          {
            key: "widget.type",
            ignore: true,
          },
        ],
      },
      {
        key: "data",
        components: [
          {
            key: "multiple",
            ignore: true,
          },
          {
            key: "persistent",
            ignore: true,
          },
          {
            key: "inputFormat",
            ignore: true,
          },
          {
            key: "protected",
            ignore: true,
          },
          {
            key: "dbIndex",
            ignore: true,
          },
          {
            key: "case",
            ignore: true,
          },
          {
            key: "encrypted",
            ignore: true,
          },
          {
            key: "redrawOn",
            ignore: true,
          },
          {
            key: "calculateServer",
            ignore: true,
          },
          {
            key: "allowCalculateOverride",
            ignore: true,
          },
        ],
      },
      {
        key: "logic",
        ignore: true,
        components: false,
      },
      {
        key: "layout",
        ignore: true,
        components: false,
      },
      ...extend,
    ]);
  }
}
