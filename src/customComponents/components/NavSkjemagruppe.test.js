import Harness from "../../../test/harness";
import FormBuilderOptions from "../../Forms/FormBuilderOptions";
import Fieldset from "formiojs/components/fieldset/Fieldset";
import NavSkjemagruppe from "./NavSkjemagruppe";

const components = [
  {
    input: true,
    tableView: true,
    inputType: "text",
    inputMask: "",
    label: "First Name",
    key: "firstName",
    placeholder: "",
    prefix: "",
    suffix: "",
    multiple: false,
    defaultValue: "",
    protected: false,
    unique: false,
    persistent: true,
    clearOnHide: true,
    validate: {
      required: false,
      minLength: "",
      maxLength: "",
      pattern: "",
      custom: "",
      customPrivate: false,
    },
    conditional: {
      show: "",
      when: null,
      eq: "",
    },
    type: "textfield",
    tags: [],
  },
  {
    input: true,
    tableView: true,
    inputType: "text",
    inputMask: "",
    label: "Last Name",
    key: "lastName",
    placeholder: "",
    prefix: "",
    suffix: "",
    multiple: false,
    defaultValue: "",
    protected: false,
    unique: false,
    persistent: true,
    clearOnHide: true,
    validate: {
      required: false,
      minLength: "",
      maxLength: "",
      pattern: "",
      custom: "",
      customPrivate: false,
    },
    conditional: {
      show: "",
      when: null,
      eq: "",
    },
    type: "textfield",
    tags: [],
  },
];

describe("Skjemagruppe", () => {
  it("Should build a navSkjemaGruppe component with empty component", () => {
    let schema = Fieldset.schema({
      ...FormBuilderOptions.builder.layout.components.navSkjemagruppe.schema,
    });
    return Harness.testCreate(NavSkjemagruppe, schema).then((component) => {
      Harness.testElements(component, 'input[type="text"]', 0);
    });
  });

  it("Should build a navSkjemaGruppe component with two textfield", () => {
    let schema = Fieldset.schema({
      ...FormBuilderOptions.builder.layout.components.navSkjemagruppe.schema,
      components,
    });
    console.log(schema);
    return Harness.testCreate(NavSkjemagruppe, schema).then((component) => {
      Harness.testElements(component, 'input[type="text"]', 2);
    });
  });
});
