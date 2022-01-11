import { migrateForm } from "./migrationScripts";

const originalTextFieldComponent = {
  label: "Fornavn",
  fieldSize: "input--xxl",
  autocomplete: "given-name",
  validateOn: "blur",
  validate: {
    required: true,
  },
  key: "nyttFornavn",
  type: "textfield",
  input: true,
  dataGridLabel: true,
  tableView: true,
};

const originalFodselsnummerComponent = {
  label: "Fødselsnummer / D-nummer",
  key: "fodselsnummerDNummer",
  type: "fnrfield",
  fieldSize: "input--s",
  input: true,
  spellcheck: false,
  dataGridLabel: true,
  validateOn: "blur",
  validate: {
    custom: "valid = instance.originalValidateFnr(input)",
    required: true,
  },
  tableView: true,
};

const originalForm = {
  path: "test-form",
  components: [originalFodselsnummerComponent, originalTextFieldComponent],
};

describe("Migration scripts", () => {
  describe("migrateForm", () => {
    it("can update component based on type", () => {
      const actual = migrateForm(originalForm, { type: "fnrfield" }, (component) => ({
        ...component,
        validate: {
          ...component.validate,
          custom: "valid = instance.newValidateFnr(input)",
        },
      }));
      expect(actual).toEqual({
        path: "test-form",
        components: [
          {
            ...originalFodselsnummerComponent,
            validate: {
              custom: "valid = instance.newValidateFnr(input)",
              required: true,
            },
          },
          originalTextFieldComponent,
        ],
      });
    });
  });
});
