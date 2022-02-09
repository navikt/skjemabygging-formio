import { componentMatchesSearchFilters, getPropertyFromComponent } from "./searchFilter";
import { originalTextFieldComponent } from "./testData";

describe("search filter", () => {
  describe("getPropertyFromComponent", () => {
    it("gets the value of a property in the object as a string", () => {
      const actual = getPropertyFromComponent({ value: "the value" }, ["value"]);
      expect(actual).toEqual("the value");
    });

    it("gets properties from nested objects", () => {
      const actual = getPropertyFromComponent({ firstLevel: { secondLevel: { thirdLevel: { value: "the value" } } } }, [
        "firstLevel",
        "secondLevel",
        "thirdLevel",
        "value",
      ]);
      expect(actual).toEqual("the value");
    });
  });

  describe("componentMatchesSearchFilters", () => {
    it("returns true if all searchFilters matches the related properties in the component", () => {
      expect(
        componentMatchesSearchFilters(originalTextFieldComponent, { fieldSize: "input--xxl", validateOn: "blur" })
      ).toBe(true);
    });

    it("returns false if one searchFilter does not match the related property in the component", () => {
      expect(
        componentMatchesSearchFilters(originalTextFieldComponent, { fieldSize: "input--s", validateOn: "blur" })
      ).toBe(false);
    });

    it("matches on nested properties", () => {
      expect(
        componentMatchesSearchFilters(originalTextFieldComponent, { "validate.required": true, validateOn: "blur" })
      ).toBe(true);
      expect(
        componentMatchesSearchFilters(originalTextFieldComponent, { "validate.required": false, validateOn: "blur" })
      ).toBe(false);
    });
  });
});
