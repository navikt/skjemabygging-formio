import objectUtils from "./objectUtils";

describe("objectUtils", () => {
  const nestedObject = {
    A: "a",
    obj1: {
      B: "b",
    },
    obj2: {
      obj3: {
        C: "c",
      },
    },
  };

  describe("flattenToArray", () => {
    it("returns an array based on callback function", () => {
      expect(objectUtils.flattenToArray(nestedObject, ([_, value]) => value)).toEqual(["a", "b", "c"]);
    });
  });

  describe("flatten", () => {
    it("returns a flattened object", () => {
      expect(objectUtils.flatten(nestedObject)).toEqual({ A: "a", B: "b", C: "c" });
    });
    it("returns a flattened object with value as key", () => {
      expect(objectUtils.flatten(nestedObject, true)).toEqual({ a: "a", b: "b", c: "c" });
    });
  });

  describe("addToMap", () => {
    it("adds entry to the map", () => {
      expect(objectUtils.addToMap({ a: "a", b: "b" }, { key: "c", value: "c" })).toEqual({ a: "a", b: "b", c: "c" });
    });
    it("can be used as a callback to reduce", () => {
      expect(
        [
          { key: "a", value: "a" },
          { key: "b", value: "b" },
        ].reduce(objectUtils.addToMap, {})
      ).toEqual({ a: "a", b: "b" });
    });
  });

  describe("concatKeys", () => {
    it("concatinates keys with . as separator", () => {
      expect(objectUtils.concatKeys("key", "parentKey")).toEqual("parentKey.key");
    });
  });
});
