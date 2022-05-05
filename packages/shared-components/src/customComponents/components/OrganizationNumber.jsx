import { validatorUtils } from "@navikt/skjemadigitalisering-shared-domain";
import TextFieldComponent from "formiojs/components/textfield/TextField";
import baseEditForm from "formiojs/components/_classes/component/Component.form";
import FormBuilderOptions from "../../Forms/form-builder-options";

export default class OrganizationNumber extends TextFieldComponent {
  static schema(...extend) {
    return TextFieldComponent.schema({
      ...FormBuilderOptions.builder.organisasjon.components.orgNr.schema,
      ...extend,
    });
  }

  validateOrganizationNumber(organizationNumber) {
    if (organizationNumber === "") {
      return true;
    }

    return validatorUtils.isOrganizationNumber(organizationNumber);
  }

  get defaultSchema() {
    return OrganizationNumber.schema();
  }

  static get builderInfo() {
    return FormBuilderOptions.builder.organisasjon.components.orgNr;
  }

  static editForm(...extend) {
    return baseEditForm(
      [
        {
          key: "display",
          components: [
            { key: "placeholder", ignore: true },
            { key: "tabindex", ignore: true },
            { key: "tooltip", ignore: true },
            { key: "customClass", ignore: true },
            { key: "hidden", ignore: true },
            { key: "hideLabel", ignore: true },
            { key: "autofocus", ignore: true },
            { key: "disabled", ignore: true },
            { key: "tableView", ignore: true },
            { key: "modalEdit", ignore: true },
          ],
        },
        { key: "data", ignore: true },
        { key: "validation", ignore: true },
        { key: "logic", ignore: true },
        { key: "layout", ignore: true },
      ],
      ...extend
    );
  }
}
