import stringUtils from "./stringUtils";

describe("stringUtils", () => {
  describe("camelCase", () => {
    it("transforms text to camel case", () => {
      expect(stringUtils.camelCase("Dette skal bli camel case")).toBe("detteSkalBliCamelCase");
    });

    it("removes characters which are not letters or numbers", () => {
      expect(stringUtils.camelCase("NAV 20-12.33")).toBe("nav201233");
    });

    it("replaces the norwegian special characters", () => {
      expect(stringUtils.camelCase("Dårlig vær på østlandet")).toBe("darligVaerPaOstlandet");
      expect(stringUtils.camelCase("Svada årelang ønskebrønn ærefull")).toBe("svadaArelangOnskebronnAerefull");
      expect(stringUtils.camelCase("ÆØÅ")).toBe("aeoa");
      expect(stringUtils.camelCase("ÆØÅ ÆØÅ")).toBe("aeoaAeoa");
    });
  });

  describe("toPascalCase", () => {
    it("changes the first character to upper case", () => {
      const actual = stringUtils.toPascalCase("word");
      expect(actual).toBe("Word");
    });

    it("handles 'words' with single characters", () => {
      const actual = stringUtils.toPascalCase("a");
      expect(actual).toBe("A");
    });
  });

  describe("addPrefixOrPostfix", () => {
    it("returns the original text if no prefix or postfix is used", () => {
      const actual = stringUtils.addPrefixOrPostfix("originalText");
      expect(actual).toBe("originalText");
    });

    it("correctly adds prefix and upper-cases the first word in the original word", () => {
      const actual = stringUtils.addPrefixOrPostfix("originalText", "prefix");
      expect(actual).toBe("prefixOriginalText");
    });

    it("correctly adds postfix to the end of the original word", () => {
      const actual = stringUtils.addPrefixOrPostfix("originalText", "", "Postfix");
      expect(actual).toBe("originalTextPostfix");
    });

    it("correctly adds prefix and postfix if both are added", () => {
      const actual = stringUtils.addPrefixOrPostfix("originalText", "prefix", "Postfix");
      expect(actual).toBe("prefixOriginalTextPostfix");
    });
  });
});
