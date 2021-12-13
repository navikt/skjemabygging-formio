import featureUtils from "./featureUtils.js";
const {toFeatureToggles} = featureUtils;

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
      expect(featureToggles).toEqual({enableTranslations: true});
    });

    it("enables translations, foo and bar", () => {
      const featureToggles = toFeatureToggles("translations,foo,bar");
      expect(featureToggles).toEqual({enableTranslations: true, enableFoo: true, enableBar: true});
    });

    it("trims and enables translations, foo and bar", () => {
      const featureToggles = toFeatureToggles(" translations  , foo,   bar ");
      expect(featureToggles).toEqual({enableTranslations: true, enableFoo: true, enableBar: true});
    });

  });

});
