import { DiffStatus, generateDiff } from "./newDiffingTool";

const clone = (data: any) => JSON.parse(JSON.stringify(data));

const testForm = {
  id: 1,
  title: "Test form",
  components: [
    {
      id: "1.1",
      key: "panel1",
      type: "panel",
      title: "Panel 1",
      components: [
        {
          id: "1.1.1",
          key: "textfield1",
          type: "textfield",
          label: "Textfield 1",
        },
        {
          id: "1.1.2",
          key: "textfield2",
          type: "textfield",
          label: "Textfield 2",
        },
      ],
    },
    {
      id: "1.2",
      key: "panel2",
      type: "panel",
      title: "Panel 2",
      components: [
        {
          id: "1.2.1",
          key: "textfield3",
          type: "textfield",
          label: "Textfield 3",
        },
      ],
    },
  ],
};

describe("newDiffingTool", () => {
  it("for an unchanged element, returns status 'unchanged'", () => {
    const actual = generateDiff({ a: "a", b: "b" }, { a: "a", b: "b" });
    expect(actual).toEqual({
      status: DiffStatus.UNCHANGED,
    });
  });

  it("for a changed element, returns status 'changed'", () => {
    const actual = generateDiff({ a: "a", b: "b" }, { a: "a", c: "c" });
    expect(actual).toEqual({
      status: DiffStatus.CHANGED,
    });
  });

  it("for an object", () => {});
  it("for an object", () => {});

  describe("for components", () => {
    it("will place all component diffs in an array", () => {
      const newForm = clone(testForm);
      newForm.components[0].title = "Changed panel 1";
      newForm.components[0].components[1].label = "Changed textfield 2";
      newForm.components[1].components[0].label = "Changed textfield 3";
      const actual = generateDiff(testForm, newForm);
      expect(actual).toEqual({});
    });
  });
});
