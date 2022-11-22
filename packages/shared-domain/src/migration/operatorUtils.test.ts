import { Operator } from "./operator";
import { combinePropAndOperator, getPropAndOperatorFromKey } from "./operatorUtils";

describe("operatorUtils", () => {
  describe("combinePropAndOperator", () => {
    it("concatenates a prop and a valid operator, separated by '__'", () => {
      expect(combinePropAndOperator("prop", "n_eq")).toEqual("prop__n_eq");
    });

    it("returns the prop if operator is invalid", () => {
      expect(combinePropAndOperator("prop", "invalid_operator" as Operator)).toEqual("prop");
    });

    it("returns the prop if operator is 'eq'", () => {
      expect(combinePropAndOperator("prop", "eq")).toEqual("prop");
    });

    it("returns the prop if operator is undefined", () => {
      expect(combinePropAndOperator("prop", undefined)).toEqual("prop");
    });
  });

  describe("getPropAndOperatorFromKey", () => {
    it("returns a tuple of prop and operator if key has valid structure and contains a valid operator", () => {
      expect(getPropAndOperatorFromKey("prop__n_eq")).toEqual(["prop", "n_eq"]);
    });

    it("returns a tuple of prop and undefined if operator is invalid", () => {
      expect(getPropAndOperatorFromKey("prop__invalid_operator")).toEqual(["prop", undefined]);
    });

    it("returns a tuple of prop and undefined if operator is 'eq'", () => {
      expect(getPropAndOperatorFromKey("prop__eq")).toEqual(["prop", undefined]);
    });

    it("returns a tuple of prop and undefined if key does not contain '__' separator", () => {
      expect(getPropAndOperatorFromKey("prop")).toEqual(["prop", undefined]);
    });
  });
});
