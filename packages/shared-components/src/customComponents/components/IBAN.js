import TextField from "formiojs/components/textfield/TextField";
import FormBuilderOptions from "../../Forms/form-builder-options";

export default class IBAN extends TextField {
  static schema(...extend) {
    return TextField.schema({
      ...FormBuilderOptions.builder.pengerOgKonto.components.iban.schema,
      ...extend,
    });
  }

  validateIban(iban) {
    return false;
  }

  get defaultSchema() {
    return IBAN.schema();
  }

  static get builderInfo() {
    return FormBuilderOptions.builder.pengerOgKonto.components.iban;
  }
}
