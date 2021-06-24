import Fieldset from "formiojs/components/fieldset/Fieldset";
import FieldsetForm from "formiojs/components/fieldset/Fieldset.form";
import FieldsetDisplayForm from "formiojs/components/fieldset/editForm/Fieldset.edit.display";
import FormBuilderOptions from "../../Forms/FormBuilderOptions";

class Skjemagruppe extends Fieldset {
  static editForm(...extend) {
    return FieldsetForm([
      {
        label: "Display",
        key: "display",
        components: [
          ...FieldsetDisplayForm,
          {
            key: "tooltip",
            ignore: true,
          },
          {
            key: "tabindex",
            ignore: true,
          },
          {
            key: "modalEdit",
            ignore: true,
          },
        ],
      },
      ...extend,
    ]);
  }

  static schema(...extend) {
    return Fieldset.schema({
      ...FormBuilderOptions.builder.layout.components.navSkjemagruppe.schema,
      ...extend,
    });
  }
}

export default Skjemagruppe;
