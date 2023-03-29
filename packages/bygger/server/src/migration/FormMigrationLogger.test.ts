import { Component, DependencyType } from "@navikt/skjemadigitalisering-shared-domain";
import { FormMigrationLogData } from "../../../types/migration";
import FormMigrationLogger from "./FormMigrationLogger";
import { componentWithSimpleConditionalToRadio, formWithSimpleConditionalToRadio, radioComponent } from "./testData";

const idKeyAndLabel = (identifier: string): Component =>
  ({
    id: `id-${identifier}`,
    key: `key-${identifier}`,
    label: `label-${identifier}`,
  } as unknown as Component);

describe("FormMigrationLogger", () => {
  let logger: FormMigrationLogger;

  beforeEach(() => {
    logger = new FormMigrationLogger(formWithSimpleConditionalToRadio);
  });

  describe("getLog", () => {
    it("contains title, path and key properties from the form", () => {
      const { name, path, title, properties } = formWithSimpleConditionalToRadio;
      expect(logger.getLog()).toEqual(expect.objectContaining({ name, path, title, ...properties }));
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
      const { key, label } = radioComponent;
      const dependency = { key, label, types: ["conditional"] as DependencyType[], matchesFilters: false };
      logger.add(
        componentWithSimpleConditionalToRadio,
        {
          ...componentWithSimpleConditionalToRadio,
          label: "New Label",
        },
        [dependency]
      );

      expect(logger.getDependencies()).toEqual({ [componentWithSimpleConditionalToRadio.key]: [dependency] });
    });

    it("returns nothing when no dependencies were added", () => {
      logger.add(componentWithSimpleConditionalToRadio, {
        ...componentWithSimpleConditionalToRadio,
        label: "New Label",
      });
      expect(logger.getDependencies()).toEqual({});
    });
  });

  describe("getBreakingChanges", () => {
    it("lists components with dependencies when changing key", () => {
      const { id, key, label } = radioComponent;
      logger.add(radioComponent, { ...radioComponent, key: "changed-key" });
      expect(logger.getBreakingChanges()).toEqual([
        {
          componentWithDependencies: {
            id,
            key_NEW: "changed-key",
            key_ORIGINAL: key,
            label,
          },
          dependentComponents: [
            {
              key: componentWithSimpleConditionalToRadio.key,
              label: componentWithSimpleConditionalToRadio.label,
            },
          ],
        },
      ]);
    });

    it("lists components with dependencies when changing values", () => {
      const newValues = [{ value: "kanskje", label: "Kanskje" }];
      logger.add(radioComponent, { ...radioComponent, values: newValues } as Component);
      expect(logger.getBreakingChanges()).toEqual([
        {
          componentWithDependencies: expect.objectContaining({
            id: radioComponent.id,
          }),
          dependentComponents: [
            {
              key: componentWithSimpleConditionalToRadio.key,
              label: componentWithSimpleConditionalToRadio.label,
            },
          ],
        },
      ]);
    });

    it("does not list components with dependencies when changing other properties, as they are not breaking changes", () => {
      logger.add(radioComponent, { ...radioComponent, type: "video" });
      logger.add(radioComponent, {
        ...radioComponent,
        newProperty: "new value",
      } as unknown as Component);
      expect(logger.getBreakingChanges()).toEqual([]);
    });
  });
});
