import { sanitizeJavaScriptCode } from "./conditional-overrides";

describe("addNullChecksForChainedLookups()", () => {
  it("does not change a string without chained lookups", () => {
    const aSentence = "this is a string.";
    expect(sanitizeJavaScriptCode(aSentence)).toEqual(aSentence);

    const aRealisticInputWithoutChainedLookups = "show = a === 'b'";
    expect(sanitizeJavaScriptCode(aRealisticInputWithoutChainedLookups)).toEqual(aRealisticInputWithoutChainedLookups);
  });

  it("correctly adds null/undefined checks for chained lookups", () => {
    const inputWithChainedLookups = "show = a.b === 'c'";
    expect(sanitizeJavaScriptCode(inputWithChainedLookups)).toEqual("show = a && a.b === 'c'");
  });

  it("correctly adds null/undefined checks for multiple chained lookups", () => {
    const inputWithMultipleChainedLookups = "show = a.b === 'c' || d.e === 'f'";
    expect(sanitizeJavaScriptCode(inputWithMultipleChainedLookups)).toEqual(
      "show = a && a.b === 'c' || d && d.e === 'f'"
    );
  });

  it("correctly adds null/undefined checks for deeply chained lookups", () => {
    const inputWithDeeplyChainedLookups = "show = a.b.c.d.e === 'f'";
    expect(sanitizeJavaScriptCode(inputWithDeeplyChainedLookups)).toEqual(
      "show = a && a.b && a.b.c && a.b.c.d && a.b.c.d.e === 'f'"
    );
  });
});
