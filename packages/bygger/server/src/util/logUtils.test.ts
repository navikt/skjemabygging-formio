import { toMeta } from "./logUtils";

describe("logUtils", () => {
  describe("toMeta", () => {
    it("adds prefix to meta object for logging", () => {
      const result = toMeta("coffee", { title: "en overskrift", message: "en melding" });
      expect(result).toEqual({
        coffee_title: "en overskrift",
        coffee_message: "en melding",
      });
    });

    it("flattens and adds prefix", () => {
      const result = toMeta("coffee", {
        title: "en overskrift",
        black: {
          one: false,
          two: "morning",
        },
      });
      expect(result).toEqual({
        coffee_title: "en overskrift",
        coffee_black_one: false,
        coffee_black_two: "morning",
      });
    });
  });
});
