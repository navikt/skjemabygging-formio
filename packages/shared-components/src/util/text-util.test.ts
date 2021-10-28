import { addPrefixOrPostfix, toPascalCase } from "./text-util";

describe("toPascalCase", () => {
  it("changes the first character to upper case", () => {
    const actual = toPascalCase("word");
    expect(actual).toEqual("Word");
  });

  it("handles 'words' with single characters", () => {
    const actual = toPascalCase("a");
    expect(actual).toEqual("A");
  });
});

describe("addPrefixOrPostfix", () => {
  it("returns the original text if no prefix or postfix is used", () => {
    const actual = addPrefixOrPostfix("originalText");
    expect(actual).toEqual("originalText");
  });

  it("correctly adds prefix and upper-cases the first word in the original word", () => {
    const actual = addPrefixOrPostfix("originalText", "prefix");
    expect(actual).toEqual("prefixOriginalText");
  });

  it("correctly adds postfix to the end of the original word", () => {
    const actual = addPrefixOrPostfix("originalText", "", "Postfix");
    expect(actual).toEqual("originalTextPostfix");
  });

  it("correctly adds prefix and postfix if both are added", () => {
    const actual = addPrefixOrPostfix("originalText", "prefix", "Postfix");
    expect(actual).toEqual("prefixOriginalTextPostfix");
  });
});