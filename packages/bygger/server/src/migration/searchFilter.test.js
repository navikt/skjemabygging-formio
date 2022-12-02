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
        componentMatchesSearchFilters(originalTextFieldComponent, [
          {
            key: "fieldSize",
            value: "input--xxl",
          },
          { key: "validateOn", value: "blur" },
        ])
      ).toBe(true);
    });

    it("returns false if one searchFilter does not match the related property in the component", () => {
      expect(
        componentMatchesSearchFilters(originalTextFieldComponent, [
          {
            key: "fieldSize",
            value: "input--s",
          },
          { key: "validateOn", value: "blur" },
        ])
      ).toBe(false);
    });

    it("matches on nested properties", () => {
      expect(
        componentMatchesSearchFilters(originalTextFieldComponent, [
          {
            key: "validate.required",
            value: true,
          },
          { key: "validateOn", value: "blur" },
        ])
      ).toBe(true);
      expect(
        componentMatchesSearchFilters(originalTextFieldComponent, [
          {
            key: "validate.required",
            value: false,
          },
          { key: "validateOn", value: "blur" },
        ])
      ).toBe(false);
    });

    describe("With operators", () => {
      const typeEqTextfield = { key: "type", value: "textfield" };
      const typeEqRadio = { key: "type", value: "radio" };
      const nonExistingProp = { key: "nonExistingProp", value: "" };

      describe("equals and not equal", () => {
        it("the operator 'eq' (equals) is the same as default", () => {
          expect(componentMatchesSearchFilters(originalTextFieldComponent, [typeEqTextfield])).toBe(true);
          expect(
            componentMatchesSearchFilters(originalTextFieldComponent, [
              {
                ...typeEqTextfield,
                operator: "eq",
              },
            ])
          ).toBe(true);

          expect(componentMatchesSearchFilters(originalTextFieldComponent, [typeEqRadio])).toBe(false);
          expect(
            componentMatchesSearchFilters(originalTextFieldComponent, [
              {
                ...typeEqRadio,
                operator: "eq",
              },
            ])
          ).toBe(false);

          expect(componentMatchesSearchFilters(originalTextFieldComponent, [nonExistingProp])).toBe(false);
          expect(
            componentMatchesSearchFilters(originalTextFieldComponent, [
              {
                ...nonExistingProp,
                operator: "eq",
              },
            ])
          ).toBe(false);
        });

        it("the operator 'n_eq' (not equals) evaluates to false when the value is equal", () => {
          expect(
            componentMatchesSearchFilters(originalTextFieldComponent, [
              {
                ...typeEqTextfield,
                operator: "n_eq",
              },
            ])
          ).toBe(false);
        });

        it("the operator 'n_eq' (not equals) evaluates to true when the value is not equal", () => {
          expect(
            componentMatchesSearchFilters(originalTextFieldComponent, [
              {
                ...typeEqRadio,
                operator: "n_eq",
              },
            ])
          ).toBe(true);
        });

        it("the operator 'n_eq' (not equals) evaluates to true when prop does not exist", () => {
          expect(
            componentMatchesSearchFilters(originalTextFieldComponent, [
              {
                ...nonExistingProp,
                operator: "n_eq",
              },
            ])
          ).toBe(true);
        });
      });

      describe("exists and not exist", () => {
        it("the operator 'exists' evaluates to false when the property exists", () => {
          expect(
            componentMatchesSearchFilters(originalTextFieldComponent, [
              {
                key: "type",
                value: "",
                operator: "exists",
              },
            ])
          ).toBe(true);
        });

        it("the operator 'exists' evaluates to false when the property does not exist", () => {
          expect(
            componentMatchesSearchFilters(originalTextFieldComponent, [
              {
                key: "non-existing-prop",
                value: "",
                operator: "exists",
              },
            ])
          ).toBe(false);
        });

        it("the operator 'n_exists' (does not exist) evaluates to false when the property exists", () => {
          expect(
            componentMatchesSearchFilters(originalTextFieldComponent, [
              {
                key: "type",
                value: "",
                operator: "n_exists",
              },
            ])
          ).toBe(false);
        });

        it("the operator 'n_exists' (does not exist) evaluates to true when the property does not exist", () => {
          expect(
            componentMatchesSearchFilters(originalTextFieldComponent, [
              {
                key: "non-existing-prop",
                value: "",
                operator: "n_exists",
              },
            ])
          ).toBe(true);
        });
      });

      describe("contains and not contain", () => {
        const customComponent = {
          ...originalTextFieldComponent,
          customLongText: "LoremIpsum1234456789!substring-in-custom-long-textqwertyuiop",
          customArray: ["a", "b", "member-of-array", "c"],
        };

        it("the operator 'contains' evaluates to true when the value is a substring", () => {
          expect(
            componentMatchesSearchFilters(customComponent, [
              {
                key: "customLongText",
                value: "substring-in-custom-long-text",
                operator: "contains",
              },
            ])
          ).toBe(true);
        });

        it("the operator 'contains' evaluates to false when the value is not a substring", () => {
          expect(
            componentMatchesSearchFilters(customComponent, [
              {
                key: "customLongText",
                value: "substring-NOT-in-custom-long-text",
                operator: "contains",
              },
            ])
          ).toBe(false);
        });

        it("the operator 'n_contains' (not contains) evaluates to false when the value is a substring", () => {
          expect(
            componentMatchesSearchFilters(customComponent, [
              {
                key: "customLongText",
                value: "substring-in-custom-long-text",
                operator: "n_contains",
              },
            ])
          ).toBe(false);
        });

        it("the operator 'n_contains' (not contains) evaluates to false when the value is not a substring", () => {
          expect(
            componentMatchesSearchFilters(customComponent, [
              {
                key: "customLongText",
                value: "substring-NOT-in-custom-long-text",
                operator: "n_contains",
              },
            ])
          ).toBe(true);
        });

        it("the operator 'contains' evaluates to true when the value is a member of an array", () => {
          expect(
            componentMatchesSearchFilters(customComponent, [
              {
                key: "customArray",
                value: "member-of-array",
                operator: "contains",
              },
            ])
          ).toBe(true);
        });

        it("the operator 'contains' evaluates to false when the value is not a member of an array", () => {
          expect(
            componentMatchesSearchFilters(customComponent, [
              {
                key: "customArray",
                value: "not-a-member-of-array",
                operator: "contains",
              },
            ])
          ).toBe(false);
        });

        it("the operator 'n_contains' (not contains) evaluates to false when the value is a substring", () => {
          expect(
            componentMatchesSearchFilters(customComponent, [
              {
                key: "customLongText",
                value: "substring-in-custom-long-text",
                operator: "n_contains",
              },
            ])
          ).toBe(false);
        });

        it("the operator 'n_contains' (not contains) evaluates to true when the value is not a substring", () => {
          expect(
            componentMatchesSearchFilters(customComponent, [
              {
                key: "customLongText",
                value: "substring-NOT-in-custom-long-text",
                operator: "n_contains",
              },
            ])
          ).toBe(true);
        });

        it("the operator 'contains' evaluates to false when the property does not exist", () => {
          expect(
            componentMatchesSearchFilters(originalTextFieldComponent, [
              {
                key: "customLongText",
                value: "substring-NOT-in-custom-long-text",
                operator: "contains",
              },
            ])
          ).toBe(false);
        });

        it("the operator 'n_contains' (not contains) evaluates to true when the property does not exist", () => {
          expect(
            componentMatchesSearchFilters(originalTextFieldComponent, [
              {
                key: "customLongText",
                value: "substring-NOT-in-custom-long-text",
                operator: "n_contains",
              },
            ])
          ).toBe(true);
        });
      });
    });
  });
});
