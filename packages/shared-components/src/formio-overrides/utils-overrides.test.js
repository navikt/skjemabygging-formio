import { sanitizeJavaScriptCode } from "./utils-overrides";

describe("sanitizeJavaScriptCode", () => {
  it("does not change a string without chained lookups", () => {
    const aSentence = "this is a string.";
    expect(sanitizeJavaScriptCode(aSentence)).toEqual(aSentence);

    const aRealisticInputWithoutChainedLookups = "show = a === 'b'";
    expect(sanitizeJavaScriptCode(aRealisticInputWithoutChainedLookups)).toEqual(aRealisticInputWithoutChainedLookups);
  });

  it("correctly adds null/undefined checks for chained lookups", () => {
    const inputWithChainedLookups = "show = a.b === 'c'";
    expect(sanitizeJavaScriptCode(inputWithChainedLookups)).toEqual("show = (a && a.b) === 'c'");
  });

  it("correctly adds null/undefined checks for multiple chained lookups", () => {
    const inputWithMultipleChainedLookups = "show = a.b === 'c' || d.e === 'f'";
    expect(sanitizeJavaScriptCode(inputWithMultipleChainedLookups)).toEqual(
      "show = (a && a.b) === 'c' || (d && d.e) === 'f'"
    );
  });

  it("correctly adds null/undefined checks for deeply chained lookups", () => {
    const inputWithDeeplyChainedLookups = "show = a.b.c.d.e === 'f'";
    expect(sanitizeJavaScriptCode(inputWithDeeplyChainedLookups)).toEqual(
      "show = (a && a.b && a.b.c && a.b.c.d && a.b.c.d.e) === 'f'"
    );
  });

  it("correctly add null/undefined checks for multiple equal chained lookups", () => {
    const inputWithMultipleEqualChainedLookups = "show = a.b === 'c' || a.b === 'd'";
    expect(sanitizeJavaScriptCode(inputWithMultipleEqualChainedLookups)).toEqual(
      "show = (a && a.b) === 'c' || (a && a.b) === 'd'"
    );
  });

  it("correctly add null/undefined checks when variable names includes numbers", () => {
    const inputWithMultipleEqualChainedLookups = "show = a1.b2 === 'c'";
    expect(sanitizeJavaScriptCode(inputWithMultipleEqualChainedLookups)).toEqual("show = (a1 && a1.b2) === 'c'");
  });

  it("will not change a partial expression", () => {
    const inputWithTwoChainedWhereOneIsAPartialOfTheOther =
      "show = anObject.aString === 'c' || anObject.aString1 === 'd'";
    const actual = sanitizeJavaScriptCode(inputWithTwoChainedWhereOneIsAPartialOfTheOther);
    expect(actual).toEqual("show = (anObject && anObject.aString) === 'c' || (anObject && anObject.aString1) === 'd'");
  });

  it("will not change a partial expression that ends in an equal expression to another complete expression", () => {
    const inputWithOneChainedExpressionEndingInAnotherExpression =
      "show = anObject.aString === 'c' || Object.aString === 'd'";
    const actual = sanitizeJavaScriptCode(inputWithOneChainedExpressionEndingInAnotherExpression);
    expect(actual).toEqual("show = (anObject && anObject.aString) === 'c' || (Object && Object.aString) === 'd'");
  });

  describe("When the code includes function calls", () => {
    it("does not add null checks for functions on instance", () => {
      const inputWithInstanceFunctionCall = "valid = instance.validate(input)";
      expect(sanitizeJavaScriptCode(inputWithInstanceFunctionCall)).toEqual("valid = instance.validate(input)");
    });

    it("does not add null checks for functions on util", () => {
      const inputWithUtilFunctionCall = "valid = util.fun(input)";
      expect(sanitizeJavaScriptCode(inputWithUtilFunctionCall)).toEqual("valid = util.fun(input)");
    });

    it("does not add null checks for functions on utils", () => {
      const inputWithUtilsFunctionCall = "valid = utils.fun(input)";
      expect(sanitizeJavaScriptCode(inputWithUtilsFunctionCall)).toEqual("valid = utils.fun(input)");
    });

    it("does not add null checks for functions on lodash", () => {
      const inputWithLodashFunctionCall = "valid = _.fun(input)";
      expect(sanitizeJavaScriptCode(inputWithLodashFunctionCall)).toEqual("valid = _.fun(input)");
    });

    it("does not add null checks for nested functions on a reserved word", () => {
      const inputWithNestedFunctionCalls = "valid = instance.fun1(_.some(data, (a) => util.fun2(a.b.c)))";
      expect(sanitizeJavaScriptCode(inputWithNestedFunctionCalls)).toEqual(
        "valid = instance.fun1(_.some(data, (a) => util.fun2((a && a.b && a.b.c))))"
      );
    });
  });
});
