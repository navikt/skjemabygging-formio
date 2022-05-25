import { DiffStatus, generateNavFormDiff } from "./formDiffingTool";
import form from "./testData/nav100750";

describe("formDiffingTool", () => {
  it("Diff same form", () => {
    const changes = generateNavFormDiff(form, form);
    expect(changes).toBeUndefined();
  });

  describe("Diff against changes", () => {
    let newForm: any;

    beforeEach(() => {
      newForm = JSON.parse(JSON.stringify(form));
    });

    it("Diff modified date", () => {
      const modified = new Date().toISOString();
      newForm.modified = modified;
      const changes: any = generateNavFormDiff(form, newForm);
      expect(changes).toHaveProperty("type");
      expect(changes).toHaveProperty("title");
      expect(changes.diff.modified.originalValue).toBe(form.modified);
      expect(changes.diff.modified.value).toBe(modified);
      expect(changes.diff.modified.status).toBe(DiffStatus.CHANGED);
    });

    it("Diff component change", () => {
      const content = "New content";
      newForm.components[0].components[0].content = content;
      const changes: any = generateNavFormDiff(form, newForm);
      checkDefaultComponentsValues(changes.components[0]);
      checkDefaultComponentsValues(changes.components[0].components[0]);
      expect(changes.components[0].components[0].diff.content.originalValue).toBe(
        form.components[0].components[0].content
      );
      expect(changes.components[0].components[0].diff.content.value).toBe(content);
      expect(changes.components[0].components[0].diff.content.status).toBe(DiffStatus.CHANGED);
    });

    it("Diff element order", () => {
      const value0 = form.components[0].components[1].values[0];
      const value1 = form.components[0].components[1].values[1];
      newForm.components[0].components[1].values[1] = value0;
      newForm.components[0].components[1].values[0] = value1;
      const changes: any = generateNavFormDiff(form, newForm);
      checkDefaultComponentsValues(changes.components[0]);
      checkDefaultComponentsValues(changes.components[0].components[0]);
      expect(changes.components[0].components[0]).toHaveProperty("diff");
      expect(changes.components[0].components[0].diff.values.status).toBe(DiffStatus.CHANGED);
    });

    it("Diff component order", () => {
      const comp0 = form.components[0].components[0];
      const comp1 = form.components[0].components[1];
      newForm.components[0].components[1] = comp0;
      newForm.components[0].components[0] = comp1;
      const changes: any = generateNavFormDiff(form, newForm);
      checkDefaultComponentsValues(changes.components[0]);
      checkDefaultComponentsValues(changes.components[0].components[0]);
      expect(changes.components[0].components[0].id).toBe(form.components[0].components[1].id);
      expect(changes.components[0].components[0].originalIndex).toBe(1);
      expect(changes.components[0].components[1].id).toBe(form.components[0].components[0].id);
      expect(changes.components[0].components[1].originalIndex).toBe(0);
    });
  });
});

const checkDefaultComponentsValues = (component: object) => {
  expect(component).toHaveProperty("id");
  expect(component).toHaveProperty("key");
  expect(component).toHaveProperty("type");
  expect(component).toHaveProperty("label");
};
