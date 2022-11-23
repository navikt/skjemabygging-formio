import { excludeQueryParam } from "./express";

describe("express (util)", () => {
  describe("excludeQueryParam", () => {
    it("excludes 'form'", () => {
      const query = {
        form: "nav123456",
        lang: "en",
      };
      const result = excludeQueryParam("form", query);
      expect(result).toEqual({ lang: "en" });
    });

    it("handles param to exclude is missing", () => {
      const query = {
        lang: "en",
      };
      const result = excludeQueryParam("form", query);
      expect(result).toEqual({ lang: "en" });
    });

    it("handles empty query", () => {
      const query = {};
      const result = excludeQueryParam("form", query);
      expect(result).toEqual({});
    });

    it("handles undefined query", () => {
      const query = undefined;
      const result = excludeQueryParam("form", query);
      expect(result).toEqual({});
    });
  });
});
