import nock from "nock";
import mockedForm from "../../example_data/Form.json";
import { componentMatchesSearchFilters, getEditScript, migrateForm, migrateForms } from "./migrationScripts";

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

  describe("migrateForms", () => {
    const fetchFormsUrl = "https://api.no";
    beforeEach(() => {
      nock(fetchFormsUrl)
        .get("/")
        .reply(200, [
          { ...mockedForm, path: "form1", properties: { skjemanummer: "form1" } },
          { ...mockedForm, path: "form2", properties: { skjemanummer: "form2" } },
          { ...mockedForm, path: "form3", properties: { skjemanummer: "form3" } },
        ]);
    });

    it("generates log only for included form paths", async () => {
      const { log } = await migrateForms({ disabled: false }, { disabled: true }, ["form1", "form3"], fetchFormsUrl);
      expect(Object.keys(log)).toEqual(["form1", "form3"]);
    });
    it("only migrates forms included by the provided formPaths", async () => {
      const { migratedForms } = await migrateForms(
        { disabled: false },
        { disabled: true },
        ["form2", "form3"],
        fetchFormsUrl
      );
      expect(migratedForms).toHaveLength(2);
      expect(migratedForms[0].path).toBe("form2");
      expect(migratedForms[1].path).toBe("form3");
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

    describe("with logger", () => {
      let logger;
      beforeEach(() => {
        logger = [];
      });

      it("adds log entry with changed being false if component wasn't edited", () => {
        getEditScript({}, logger)(testComponent);
        expect(logger.length).toBe(1);
        expect(logger[0].changed).toEqual(false);
      });

      it("adds log entry with changed being true if component was edited", () => {
        getEditScript({ prop1: "newValue" }, logger)(testComponent);
        expect(logger.length).toBe(1);
        expect(logger[0].changed).toEqual(true);
      });

      it("adds log entry for each tested component", () => {
        const editScript = getEditScript({ prop1: "newValue" }, logger);
        editScript(testComponent);
        editScript(testComponent);
        editScript(testComponent);
        expect(logger.length).toBe(3);
      });
    });
  });

  describe("componentMatchesSearchFilters", () => {
    it("returns true if all searchFilters matches the related properties in the component", () => {
      expect(
        componentMatchesSearchFilters(originalTextFieldComponent, { fieldSize: "input--xxl", validateOn: "blur" })
      ).toBe(true);
    });

    it("returns false if one searchFilter does not match the related property in the component", () => {
      expect(
        componentMatchesSearchFilters(originalTextFieldComponent, { fieldSize: "input--s", validateOn: "blur" })
      ).toBe(false);
    });

    it("matches on nested properties", () => {
      expect(
        componentMatchesSearchFilters(originalTextFieldComponent, { "validate.required": true, validateOn: "blur" })
      ).toBe(true);
      expect(
        componentMatchesSearchFilters(originalTextFieldComponent, { "validate.required": false, validateOn: "blur" })
      ).toBe(false);
    });
  });
});
