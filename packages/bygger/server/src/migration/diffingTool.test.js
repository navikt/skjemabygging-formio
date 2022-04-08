import { generateDiff } from "./diffingTool";

describe("diffingTool", () => {
  it("returns empty object when the two versions are identical", () => {
    const actual = generateDiff({ value: "a value" }, { value: "a value" });
    expect(actual).toEqual({});
  });

  it("lists the original and the new value if a property is different in the two versions", () => {
    const actual = generateDiff({ value: "the original value" }, { value: "the new value" });
    expect(actual).toEqual({
      value_NEW: "the new value",
      value_ORIGINAL: "the original value",
    });
  });

  it("lists original and new values of all properties that have changed", () => {
    const actual = generateDiff(
      { value1: "the original value 1", value2: "the original value 2" },
      { value1: "the new value 1", value2: "the new value 2" }
    );
    expect(actual).toEqual({
      value1_NEW: "the new value 1",
      value1_ORIGINAL: "the original value 1",
      value2_NEW: "the new value 2",
      value2_ORIGINAL: "the original value 2",
    });
  });

  it("lists only changes for properties that have changed values, not the others", () => {
    const actual = generateDiff(
      { value1: "the original value 1", value2: "the same value 2" },
      { value1: "the new value 1", value2: "the same value 2" }
    );
    expect(actual).toEqual({
      value1_NEW: "the new value 1",
      value1_ORIGINAL: "the original value 1",
    });
  });

  it("will diff nested objects", () => {
    const actual = generateDiff(
      {
        nested: {
          value: "original nested value",
        },
      },
      {
        nested: {
          value: "new nested value",
        },
      }
    );

    expect(actual).toEqual({
      nested: {
        value_NEW: "new nested value",
        value_ORIGINAL: "original nested value",
      },
    });
  });

  it("lists only changes in nested objects that have changed", () => {
    const actual = generateDiff(
      {
        same: "same value",
        nested: {
          value: "original nested value",
          same: "same nested value",
        },
      },
      {
        same: "same value",
        nested: {
          value: "new nested value",
          same: "same nested value",
        },
      }
    );

    expect(actual).toEqual({
      nested: {
        value_NEW: "new nested value",
        value_ORIGINAL: "original nested value",
      },
    });
  });

  it("lists changes for different levels of nesting at the same time", () => {
    const actual = generateDiff(
      {
        same: "same value",
        value: "original value",
        nested: {
          value: "original nested value",
          same: "same nested value",
        },
      },
      {
        same: "same value",
        value: "new value",
        nested: {
          value: "new nested value",
          same: "same nested value",
        },
      }
    );

    expect(actual).toEqual({
      value_NEW: "new value",
      value_ORIGINAL: "original value",
      nested: {
        value_NEW: "new nested value",
        value_ORIGINAL: "original nested value",
      },
    });
  });

  it("will show diff for changes to key or label, but not id", () => {
    const actual = generateDiff(
      {
        id: "original id",
        key: "original key",
        label: "original label",
      },
      {
        id: "new ID",
        key: "new key",
        label: "new label",
      }
    );

    expect(actual).toEqual({
      id: "original id",
      key_NEW: "new key",
      key_ORIGINAL: "original key",
      label_NEW: "new label",
      label_ORIGINAL: "original label",
    });
  });
});
