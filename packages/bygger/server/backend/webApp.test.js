import {isValidResource} from "./webApp";

describe("webApp", () => {

  describe("isValidResource", () => {

    it("mottaksadresser is valid", () => {
      expect(isValidResource("mottaksadresser")).toBe(true);
    });

    describe("global-translations", () => {

      it("global-translations without language code is not valid", () => {
        expect(isValidResource("global-translations")).toBe(false);
      });

      it("en is valid", () => {
        expect(isValidResource("global-translations-en")).toBe(true);
      });

      it("pl is valid", () => {
        expect(isValidResource("global-translations-pl")).toBe(true);
      });

      it("nn-NO is valid", () => {
        expect(isValidResource("global-translations-nn-NO")).toBe(true);
      });

      it("accepts only language codes as postfix", () => {
        expect(isValidResource("global-translations-randomstring")).toBe(false);
      });

    });

  });

});
