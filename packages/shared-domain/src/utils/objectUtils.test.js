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

  describe("isObject", () => {
    it("returns false on arrays", () => {
      expect(objectUtils.isObject([])).toBe(false);
    });
    it("returns false on undefined", () => {
      expect(objectUtils.isObject(undefined)).toBe(false);
    });
    it("returns false on strings", () => {
      expect(objectUtils.isObject("string")).toBe(false);
    });
    it("returns true on objects", () => {
      expect(objectUtils.isObject({})).toBe(true);
    });
  });

  describe("deepMerge", () => {
    it("merges two objects", () => {
      expect(objectUtils.deepMerge({ a: "1" }, { b: "2" })).toEqual({ a: "1", b: "2" });
    });
    it("overwrites properties in objectA when objectB has the same key", () => {
      expect(objectUtils.deepMerge({ a: "1", b: "2" }, { a: "3", c: "4" })).toEqual({ a: "3", b: "2", c: "4" });
    });
    it("merges two nested objects", () => {
      expect(
        objectUtils.deepMerge({ a: { a1: { a12: "foo" } }, b: "b" }, { a: { a1: { a12: "bar" }, a2: "baz" } })
      ).toEqual({ a: { a1: { a12: "bar" }, a2: "baz" }, b: "b" });
    });
    it("overwrites a value in objectA with undefined, when the key is set to undefined in objectB", () => {
      expect(objectUtils.deepMerge({ a: "a", b: "b" }, { a: undefined })).toEqual({ a: undefined, b: "b" });
    });
    it("returns objectB if objectA is undefined", () => {
      expect(objectUtils.deepMerge(undefined, { a: "a", b: "b" })).toEqual({ a: "a", b: "b" });
    });
    it("returns objectA if objectB is undefined", () => {
      expect(objectUtils.deepMerge({ a: "a", b: "b" }, undefined)).toEqual({ a: "a", b: "b" });
    });
  });
});
