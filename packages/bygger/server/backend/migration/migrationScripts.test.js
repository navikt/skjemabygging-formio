import nock from "nock";
import mockedForm from "../../../example_data/Form";
import { getBreakingChanges, getEditScript, migrateForm, migrateForms } from "./migrationScripts";
import {
  originalFodselsnummerComponent,
  originalForm,
  originalPanelComponent,
  originalSkjemaGruppeComponent,
  originalTextFieldComponent,
} from "./testData";

const migrateFnrFieldFunction = (component) => ({
  ...component,
  validate: {
    ...component.validate,
    custom: "valid = instance.newValidateFnr(input)",
  },
});

function createTestForm(...components) {
  return {
    path: "testForm",
    title: "Test form",
    properties: {
      skjemanummer: "TEST-form",
    },
    components: [...components],
  };
}

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

  describe("getBreakingChanges", () => {
    const componentThatIsChanged = {
      key: "comp-that-is-changed",
      id: "comp-that-is-changed",
      label: "Component that is changed",
      values: [
        {
          value: "ja",
          label: "Ja",
        },
        {
          value: "nei",
          label: "Nei",
        },
      ],
    };

    const componentWithSimpleConditional = {
      key: "comp-with-simple-conditional",
      id: "comp-with-simple-conditional",
      label: "Component with simple conditional",
      conditional: {
        show: true,
        when: "comp-that-is-changed",
        eq: "ja",
      },
    };

    /*const componentWithConditionalOnValues = {
      key: "comp-with-conditional-on-values",
      id: "comp-with-conditional-on-values",
      label: "Component with conditional on values",
    };*/

    function createAffectedComponent(...diffs) {
      return diffs.map((diff) => ({ diff }));
    }

    it("lists components with dependencies when changing key", () => {
      const testForm = createTestForm(componentThatIsChanged, componentWithSimpleConditional);
      const affectedComponents = createAffectedComponent({
        id: "comp-that-is-changed",
        key_NEW: "changed-key",
        key_ORIGINAL: "comp-that-is-changed",
        label: "Component that is changed",
      });
      //expect(testForm).toEqual([]);
      const actual = getBreakingChanges(testForm, affectedComponents);
      expect(actual).toEqual([
        {
          componentWithDependencies: {
            id: "comp-that-is-changed",
            key_NEW: "changed-key",
            key_ORIGINAL: "comp-that-is-changed",
            label: "Component that is changed",
          },
          dependentComponents: [
            {
              key: "comp-with-simple-conditional",
              label: "Component with simple conditional",
            },
          ],
        },
      ]);
    });
    it("lists components with dependencies when changing values", () => {
      const testForm = createTestForm(componentThatIsChanged, componentWithSimpleConditional);
      const { id, key, label, values } = componentThatIsChanged;
      const affectedComponents = createAffectedComponent({
        id,
        key,
        label,
        values_NEW: [
          ...values,
          {
            value: "kanskje",
            label: "Kanskje",
          },
        ],
        values_ORIGINAL: values,
      });

      const actual = getBreakingChanges(testForm, affectedComponents);
      expect(actual).toEqual([
        {
          componentWithDependencies: expect.objectContaining({
            id: "comp-that-is-changed",
          }),
          dependentComponents: [
            {
              key: "comp-with-simple-conditional",
              label: "Component with simple conditional",
            },
          ],
        },
      ]);
    });
    it("does not list components with dependencies when changing other properties, as they are not breaking changes", () => {
      const testForm = createTestForm(
        { ...componentThatIsChanged, oldProperty: "old value" },
        componentWithSimpleConditional
      );
      const affectedComponents = createAffectedComponent({
        ...componentThatIsChanged,
        oldProperty: "changed value",
        newProperty: "new value",
      });

      const actual = getBreakingChanges(testForm, affectedComponents);
      expect(actual).toEqual([]);
    });
  });
});
