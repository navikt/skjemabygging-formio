import { clean } from "./logCleaning.js";
import logStatement1 from "./testdata/log-statement-1.js";

describe("logCleaning", () => {
  describe("clean", () => {
    it("replaces certain keys which value should not appear in logs", () => {
      const cleaned = clean(logStatement1);
      expect(JSON.stringify(cleaned)).not.toContain("Bearer 123456789");
      expect(JSON.stringify(cleaned)).not.toContain("Complete-azure-access-token");
    });
  });
});
