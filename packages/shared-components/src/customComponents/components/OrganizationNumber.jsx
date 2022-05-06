import { validatorUtils } from "@navikt/skjemadigitalisering-shared-domain";
import baseEditForm from "formiojs/components/_classes/component/Component.form";
import FormBuilderOptions from "../../Forms/form-builder-options";
import { advancedDescription } from "./fields/advancedDescription.js";
import Number from "./Number.js";

export default class OrganizationNumber extends Number {
  validateOrganizationNumber(organizationNumber) {
    if (organizationNumber === "") {
      return true;
    }

    // Force organizationNumber to string
    return validatorUtils.isOrganizationNumber(organizationNumber + "");
  }

  static get builderInfo() {
    return FormBuilderOptions.builder.organisasjon.components.orgNr;
  }

  static editForm(...extend) {
    return baseEditForm([
      ...extend,
      {
        key: "display",
        components: [
          ...advancedDescription,
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
      {
        key: "validation",
        components: [
          { key: "validateOn", ignore: true },
          { key: "unique", ignore: true },
          { key: "errorLabel", ignore: true },
          { key: "validate.customMessage", ignore: true },
          { key: "custom-validation-js", ignore: true },
          { key: "json-validation-json", ignore: true },
          { key: "errors", ignore: true },
        ],
      },
      { key: "data", ignore: true },
      { key: "logic", ignore: true },
      { key: "layout", ignore: true },
      { key: "addons", ignore: true },
    ]);
  }
}
