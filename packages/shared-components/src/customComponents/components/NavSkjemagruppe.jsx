import Fieldset from "formiojs/components/fieldset/Fieldset";
import NestedComponentForm from "formiojs/components/_classes/nested/NestedComponent.form";
import FieldsetDisplayForm from "formiojs/components/fieldset/editForm/Fieldset.edit.display";
import FormBuilderOptions from "../../Forms/FormBuilderOptions";
import { descriptionPositionField } from "./fields/descriptionPositionField";

class Skjemagruppe extends Fieldset {
  static editForm(...extend) {
    return NestedComponentForm([
      {
        key: "display",
        components: [
          ...FieldsetDisplayForm.filter((field) => field.key !== "description"),
          descriptionPositionField,
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
