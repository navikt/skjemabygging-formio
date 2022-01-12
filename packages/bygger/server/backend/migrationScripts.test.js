import { getEditScript, migrateForm } from "./migrationScripts";

const originalPanelComponent = {
  title: "Veiledning",
  breadcrumbClickable: true,
  buttonSettings: {
    previous: true,
    cancel: true,
    next: true,
  },
  navigateOnEnter: false,
  saveOnEnter: false,
  scrollToTop: false,
  collapsible: false,
  key: "veiledning",
  type: "panel",
  label: "Veiledning",
  input: false,
  components: [],
  tableView: false,
};

const originalSkjemaGruppeComponent = {
  legend: "Skjemagruppe",
  key: "navSkjemagruppe",
  type: "navSkjemagruppe",
  label: "Skjemagruppe",
  input: false,
  tableView: false,
  components: [],
};

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

const migrateFnrFieldFunction = (component) => ({
  ...component,
  validate: {
    ...component.validate,
    custom: "valid = instance.newValidateFnr(input)",
  },
});

describe("Migration scripts", () => {
  describe("migrateForm", () => {
    it("can update component based on type", () => {
      const actual = migrateForm(originalForm, { type: "fnrfield" }, migrateFnrFieldFunction);
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

    it("can migrate subcomponents", () => {
      const actual = migrateForm(
        {
          path: "test-form",
          components: [
            {
              ...originalPanelComponent,
              components: [originalFodselsnummerComponent],
            },
          ],
        },
        { type: "fnrfield" },
        migrateFnrFieldFunction
      );

      expect(actual).toEqual({
        path: "test-form",
        components: [
          {
            ...originalPanelComponent,
            components: [
              {
                ...originalFodselsnummerComponent,
                validate: {
                  custom: "valid = instance.newValidateFnr(input)",
                  required: true,
                },
              },
            ],
          },
        ],
      });
    });

    it("can migrate subcomponents of a migrated component", () => {
      const actual = migrateForm(
        {
          path: "test-form",
          components: [
            {
              ...originalSkjemaGruppeComponent,
              components: [
                {
                  ...originalSkjemaGruppeComponent,
                  key: "subSkjemaGruppe",
                  components: [originalTextFieldComponent],
                },
              ],
            },
          ],
        },
        { type: "navSkjemagruppe" },
        (component) => ({
          ...component,
          modifiedByTest: true,
        })
      );

      expect(actual).toEqual({
        path: "test-form",
        components: [
          {
            ...originalSkjemaGruppeComponent,
            modifiedByTest: true,
            components: [
              {
                ...originalSkjemaGruppeComponent,
                key: "subSkjemaGruppe",
                modifiedByTest: true,
                components: [originalTextFieldComponent],
              },
            ],
          },
        ],
      });
    });
  });

  describe("getEditScript", () => {
    let testComponent;
    beforeEach(() => {
      testComponent = {
        prop1: "prop1",
        prop2: {
          prop2_1: "prop2_1",
          prop2_2: "prop2_2",
          prop2_3: "prop2_3",
        },
        prop3: {
          prop3_1: {
            prop3_1_1: "prop3_1_1",
            prop3_1_2: "prop3_1_2",
          },
          prop3_2: {
            prop3_2_1: "prop3_2_1",
          },
          prop3_3: "prop3_3",
        },
      };
    });

    it("returns the original component if editOptions is empty", () => {
      expect(getEditScript({})(testComponent)).toEqual(testComponent);
    });

    it("edits a property", () => {
      const editOptions = { prop1: "newValue" };
      expect(getEditScript(editOptions)(testComponent)).toEqual({ ...testComponent, prop1: "newValue" });
    });

    it("edits properties in nested property, while preserving existing properties", () => {
      const editOptions = { "prop2.prop2_1": "newValue1", "prop2.prop2_2": "newValue2" };
      expect(getEditScript(editOptions)(testComponent)).toEqual({
        ...testComponent,
        prop2: { ...testComponent.prop2, prop2_1: "newValue1", prop2_2: "newValue2" },
      });
    });

    it("edits properties in several nested properties, while preserving existing properties", () => {
      const editOptions = {
        prop1: "newValue1",
        "prop2.prop2_2": "newValue2",
        "prop3.prop3_1.prop3_1_1": "newValue3",
        "prop3.prop3_3": "newValue4",
      };
      expect(getEditScript(editOptions)(testComponent)).toEqual({
        ...testComponent,
        prop1: "newValue1",
        prop2: { ...testComponent.prop2, prop2_2: "newValue2" },
        prop3: {
          ...testComponent.prop3,
          prop3_1: { ...testComponent.prop3.prop3_1, prop3_1_1: "newValue3" },
          prop3_3: "newValue4",
        },
      });
    });
  });
});
