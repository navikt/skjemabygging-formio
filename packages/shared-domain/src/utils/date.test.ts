import { getIso8601String } from "./date";

describe("date.ts", () => {
  describe("getIso8601String", () => {
    it("Validate format", () => {
      const now = getIso8601String();
      // Expected example format 2022-01-01T12:00:00.000Z
      expect(now).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });
});
