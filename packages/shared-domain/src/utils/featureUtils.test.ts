import featureUtils from "./featureUtils";
const { toFeatureToggles } = featureUtils;

describe("features", () => {
  describe("toFeatureToggles", () => {
    it("returns empty object when undefined", () => {
      const featureToggles = toFeatureToggles(undefined);
      expect(featureToggles).toEqual({});
    });

    it("returns empty object when empty", () => {
      const featureToggles = toFeatureToggles("");
      expect(featureToggles).toEqual({});
    });

    it("returns empty object when null", () => {
      const featureToggles = toFeatureToggles(null);
      expect(featureToggles).toEqual({});
    });

    it("enables translations", () => {
      const featureToggles = toFeatureToggles("translations");
      expect(featureToggles).toEqual({ enableTranslations: true });
    });

    it("enables translations, foo and bar", () => {
      const featureToggles = toFeatureToggles("translations,foo,bar");
      expect(featureToggles).toEqual({ enableTranslations: true, enableFoo: true, enableBar: true });
    });

    it("trims and enables translations, foo and bar", () => {
      const featureToggles = toFeatureToggles(" translations  , foo,   bar ");
      expect(featureToggles).toEqual({ enableTranslations: true, enableFoo: true, enableBar: true });
    });

    describe("support for enabling and disabling with booleans", () => {
      it("one disable and one enable", () => {
        const featureToggles = toFeatureToggles("translations=false,autoComplete=true");
        expect(featureToggles).toEqual({ enableTranslations: false, enableAutoComplete: true });
      });

      it("one disabled, and one defaults to enabled", () => {
        const featureToggles = toFeatureToggles("translations=false,autoComplete");
        expect(featureToggles).toEqual({ enableTranslations: false, enableAutoComplete: true });
      });

      it("one disabled, one defaults to enabled, and one explicitly enabled", () => {
        const featureToggles = toFeatureToggles("translations=false,autoComplete, diff=true");
        expect(featureToggles).toEqual({ enableTranslations: false, enableAutoComplete: true, enableDiff: true });
      });

      it("one explicitly enabled with spaces", () => {
        const featureToggles = toFeatureToggles(" diff=true   ");
        expect(featureToggles).toEqual({ enableDiff: true });
      });
    });
  });
});
