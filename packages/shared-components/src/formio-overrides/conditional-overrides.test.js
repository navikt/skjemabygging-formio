import { sanitizeCustomConditional } from "./conditional-overrides";

describe("addNullChecksForChainedLookups()", () => {
  it("does not change a string without chained lookups", () => {
    const aSentence = "this is a string.";
    expect(sanitizeCustomConditional(aSentence)).toEqual(aSentence);

    const aRealisticInputWithoutChainedLookups = "show = a === 'b'";
    expect(sanitizeCustomConditional(aRealisticInputWithoutChainedLookups)).toEqual(
      aRealisticInputWithoutChainedLookups
    );
  });

  it("correctly adds null/undefined checks for chained lookups", () => {
    const inputWithChainedLookups = "show = a.b === 'c'";
    expect(sanitizeCustomConditional(inputWithChainedLookups)).toEqual("show = a && a.b === 'c'");
  });

  it("correctly adds null/undefined checks for multiple chained lookups", () => {
    const inputWithMultipleChainedLookups = "show = a.b === 'c' || d.e === 'f'";
    expect(sanitizeCustomConditional(inputWithMultipleChainedLookups)).toEqual(
      "show = a && a.b === 'c' || d && d.e === 'f'"
    );
  });

  it("correctly adds null/undefined checks for deeply chained lookups", () => {
    const inputWithDeeplyChainedLookups = "show = a.b.c.d.e === 'f'";
    expect(sanitizeCustomConditional(inputWithDeeplyChainedLookups)).toEqual(
      "show = a && a.b && a.b.c && a.b.c.d && a.b.c.d.e === 'f'"
    );
  });
});
