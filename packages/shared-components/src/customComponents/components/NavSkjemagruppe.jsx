import FieldsetDisplayForm from "formiojs/components/fieldset/editForm/Fieldset.edit.display";
import Fieldset from "formiojs/components/fieldset/Fieldset";
import NestedComponentForm from "formiojs/components/_classes/nested/NestedComponent.form";
import FormBuilderOptions from "../../Forms/form-builder-options";
import { advancedDescription } from "./fields/advancedDescription.js";

class Skjemagruppe extends Fieldset {
  static editForm(...extend) {
    return NestedComponentForm([
      {
        key: "display",
        components: [
          ...FieldsetDisplayForm.filter((field) => field.key !== "description"),
          ...advancedDescription,
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
          {
            key: "customClass",
            ignore: true,
          },
          {
            key: "hidden",
            ignore: true,
          },
          {
            key: "disabled",
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

  static schema(...extend) {
    return Fieldset.schema({
      ...FormBuilderOptions.builder.layout.components.navSkjemagruppe.schema,
      ...extend,
    });
  }
}

export default Skjemagruppe;
