import Fieldset from "formiojs/components/fieldset/Fieldset";
import FormBuilderOptions from "../../Forms/FormBuilderOptions";

class Skjemagruppe extends Fieldset {
  static schema(...extend) {
    return Fieldset.schema({
      ...FormBuilderOptions.builder.layout.components.navSkjemagruppe.schema,
      ...extend,
    });
  }
}

export default Skjemagruppe;
