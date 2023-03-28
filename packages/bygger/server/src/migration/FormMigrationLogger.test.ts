import { Component, DependencyType, NavFormType } from "@navikt/skjemadigitalisering-shared-domain";
import { FormMigrationLogData } from "../../../types/migration";
import FormMigrationLogger from "./FormMigrationLogger";

const idKeyAndLabel = (identifier: string): Component =>
  ({
    id: `id-${identifier}`,
    key: `key-${identifier}`,
    label: `label-${identifier}`,
  } as unknown as Component);

const otherComponentIsDependentOn = {
  key: "dependee",
  id: "dependee",
  label: "Component that is changed",
  isAttachmentPanel: true,
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
} as unknown as Component;

const withSimpleConditional = {
  key: "has-dependency",
  id: "has-dependency",
  label: "Component with simple conditional",
  conditional: {
    show: true,
    when: "dependee",
    eq: "ja",
  },
} as unknown as Component;

const properties = {
  skjemanummer: "TEST-form",
  modified: "2022-11-17T13:12:38.825Z",
  modifiedBy: "user@company.com",
  published: "2022-11-17T13:12:38.825Z",
  publishedBy: "publisher@company.com",
  unpublished: "2022-12-24T17:00:00.825Z",
  unpublishedBy: "user@company.com",
  isTestForm: false,
  publishedLanguages: ["en"],
};

const testForm = {
  name: "testForm",
  path: "testForm",
  title: "Test form",
  properties,
  components: [otherComponentIsDependentOn, withSimpleConditional],
} as NavFormType;

describe("FormMigrationLogger", () => {
  let logger: FormMigrationLogger;

  beforeEach(() => {
    logger = new FormMigrationLogger(testForm);
  });

  describe("getLog", () => {
    it("contains title, path and key properties from the form", () => {
      expect(logger.getLog()).toEqual(
        expect.objectContaining({
          name: "testForm",
          path: "testForm",
          title: "Test form",
          ...properties,
        })
      );
    });

    describe("When all entries contains identical original and new components", () => {
      let log: FormMigrationLogData;
      beforeEach(() => {
        logger.add(idKeyAndLabel("a"), idKeyAndLabel("a"));
        logger.add(idKeyAndLabel("b"), idKeyAndLabel("b"));
        logger.add(idKeyAndLabel("c"), idKeyAndLabel("c"));
        log = logger.getLog();
      });

      it("'found' matches the number of added entries", () => {
        expect(log.found).toBe(3);
      });

      it("'changed' is 0", () => {
        expect(log.changed).toBe(0);
      });

      it("diff contains all added entries", () => {
        expect(log.diff).toHaveLength(3);
      });
    });

    describe("When added entries includes changed compoenntes", () => {
      let log: FormMigrationLogData;
      const componentA = idKeyAndLabel("a");
      const componentB = idKeyAndLabel("b");
      const noChanges = idKeyAndLabel("no-changes");
      beforeEach(() => {
        logger.add(
          { ...componentA, customProperty: "old value" } as Component,
          { ...componentA, customProperty: "new value" } as Component
        );
        logger.add(idKeyAndLabel("no-changes"), idKeyAndLabel("no-changes"));
        logger.add(
          { ...componentB, customProperty: "old value" } as Component,
          { ...componentB, customProperty: "new value" } as Component
        );
        log = logger.getLog();
      });

      it("'found' matches the number of added entries", () => {
        expect(log.found).toBe(3);
      });

      it("'changed' matches the number of changed components", () => {
        expect(log.changed).toBe(2);
      });

      it("diff contains entries for each changed and unchanged components component", () => {
        expect(log.diff).toEqual([
          expect.objectContaining({
            key: componentA.key,
            customProperty_ORIGINAL: "old value",
            customProperty_NEW: "new value",
          }),
          noChanges,
          expect.objectContaining({
            key: componentB.key,
            customProperty_ORIGINAL: "old value",
            customProperty_NEW: "new value",
          }),
        ]);
      });
    });
  });

  describe("getDependencies", () => {
    it("returns dependencies", () => {
      const { key, label } = otherComponentIsDependentOn;
      const dependency = { key, label, types: ["conditional"] as DependencyType[], matchesFilters: false };
      logger.add(withSimpleConditional, { ...withSimpleConditional, label: "New Label" }, [dependency]);

      expect(logger.getDependencies()).toEqual({ [withSimpleConditional.key]: [dependency] });
    });

    it("returns nothing when no dependencies were added", () => {
      logger.add(withSimpleConditional, { ...withSimpleConditional, label: "New Label" });
      expect(logger.getDependencies()).toEqual({});
    });
  });

  describe("getBreakingChanges", () => {
    it("lists components with dependencies when changing key", () => {
      logger.add(otherComponentIsDependentOn, { ...otherComponentIsDependentOn, key: "changed-key" });
      expect(logger.getBreakingChanges()).toEqual([
        {
          componentWithDependencies: {
            id: "dependee",
            key_NEW: "changed-key",
            key_ORIGINAL: "dependee",
            label: "Component that is changed",
          },
          dependentComponents: [
            {
              key: "has-dependency",
              label: "Component with simple conditional",
            },
          ],
        },
      ]);
    });

    it("lists components with dependencies when changing values", () => {
      const newValues = [{ value: "kanskje", label: "Kanskje" }];
      logger.add(otherComponentIsDependentOn, { ...otherComponentIsDependentOn, values: newValues } as Component);
      expect(logger.getBreakingChanges()).toEqual([
        {
          componentWithDependencies: expect.objectContaining({
            id: "dependee",
          }),
          dependentComponents: [
            {
              key: "has-dependency",
              label: "Component with simple conditional",
            },
          ],
        },
      ]);
    });

    it("does not list components with dependencies when changing other properties, as they are not breaking changes", () => {
      logger.add(otherComponentIsDependentOn, { ...otherComponentIsDependentOn, isAttachmentPanel: false });
      logger.add(otherComponentIsDependentOn, {
        ...otherComponentIsDependentOn,
        newProperty: "new value",
      } as unknown as Component);
      expect(logger.getBreakingChanges()).toEqual([]);
    });
  });
});
