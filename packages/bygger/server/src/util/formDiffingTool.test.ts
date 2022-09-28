import { NavFormType } from "@navikt/skjemadigitalisering-shared-domain";
import { DiffStatus, generateNavFormDiff } from "./formDiffingTool";
import testForm from "./testData/nav100750";

describe("Final diffing tool", () => {
  let newForm: NavFormType;
  beforeEach(() => {
    newForm = JSON.parse(JSON.stringify(testForm));
  });

  describe("if new and original form is equal", () => {
    it("returns status UNCHANGED", () => {
      const actual = generateNavFormDiff(testForm, newForm);
      expect(actual.status).toEqual(DiffStatus.UNCHANGED);
    });
  });

  describe("if components have been added", () => {
    beforeEach(() => {
      newForm.components.push({
        title: "New panel",
        id: "new-panel-1",
        components: [
          {
            id: "new-component-1",
            key: "new-component",
            label: "New component",
            type: "textfield",
          },
        ],
        key: "new-panel",
        label: "New panel",
        type: "panel",
      });
    });

    it("returns form status as changed and lists new components", () => {
      const actual = generateNavFormDiff(testForm, newForm);
      expect(actual.status).toEqual(DiffStatus.CHANGED);
      expect(actual.diff).toContainEqual({ id: "new-panel-1", status: DiffStatus.NEW });
    });

    it("and also lists new child components", () => {
      const actual = generateNavFormDiff(testForm, newForm);
      expect(actual.diff).toContainEqual({ id: "new-component-1", status: DiffStatus.NEW });
    });
  });

  describe("if components have been removed", () => {
    beforeEach(() => {
      newForm.components = newForm.components.filter((panel) => panel.title !== "Erklæring");
    });

    it("returns form status as changed and lists deleted components", () => {
      const actual = generateNavFormDiff(testForm, newForm);
      expect(actual.status).toEqual(DiffStatus.CHANGED);
      expect(actual.diff).toContainEqual({ id: "e18zgdj", status: DiffStatus.DELETED });
    });

    it("and also lists deleted child components", () => {
      const actual = generateNavFormDiff(testForm, newForm);
      expect(actual.diff).toContainEqual({ id: "exys8b", status: DiffStatus.DELETED });
    });
  });

  describe("if a component has been modified", () => {
    describe("by changing a value", () => {
      it("returns the component status as CHANGED and lists the diff of the changed value(s)", () => {
        newForm.components[0].title = "New panel title";

        const actual = generateNavFormDiff(testForm, newForm);
        expect(actual.status).toEqual(DiffStatus.CHANGED);
        expect(actual.diff).toContainEqual({
          id: "eqw0kec",
          status: DiffStatus.CHANGED,
          diff: [
            {
              id: "title",
              before: "Introduksjon",
              after: "New panel title",
              status: DiffStatus.CHANGED,
            },
          ],
        });
      });
    });
  });
});
