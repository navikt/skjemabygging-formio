import objectUtils from "./objectUtils";

describe("objectUtils", () => {
  describe("flatten", () => {
    it("returns an array based on callback function", () => {
      expect(
        objectUtils.flatten(
          {
            a: "a",
            obj1: {
              b: "b",
            },
            obj2: {
              obj3: {
                c: "c",
              },
            },
          },
          ([_, value]) => value
        )
      ).toEqual(["a", "b", "c"]);
    });
  });

  describe("toMap", () => {
    it("adds entry to the map", () => {
      expect(objectUtils.toMap({ a: "a", b: "b" }, { key: "c", value: "c" })).toEqual({ a: "a", b: "b", c: "c" });
    });
    it("can be used as a callback to reduce", () => {
      expect(
        [
          { key: "a", value: "a" },
          { key: "b", value: "b" },
        ].reduce(objectUtils.toMap, {})
      ).toEqual({ a: "a", b: "b" });
    });
  });

  describe("concatKeys", () => {
    it("concatinates keys with . as separator", () => {
      expect(objectUtils.concatKeys("key", "parentKey")).toEqual("parentKey.key");
    });
  });
});
