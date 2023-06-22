import validatorUtils from "./validatorUtils";

describe("validatorUtils.ts", () => {
  describe("validatorUtils.isOrganizationNumber", () => {
    it("Valid organization numbers", () => {
      expect(validatorUtils.isOrganizationNumber("889640782")).toBe(true);
      expect(validatorUtils.isOrganizationNumber("974652277")).toBe(true);
      expect(validatorUtils.isOrganizationNumber("824521042")).toBe(true);
      expect(validatorUtils.isOrganizationNumber("874652202")).toBe(true);
      expect(validatorUtils.isOrganizationNumber("991012133")).toBe(true);
      expect(validatorUtils.isOrganizationNumber("995199939")).toBe(true);
      expect(validatorUtils.isOrganizationNumber("921858361")).toBe(true);
      expect(validatorUtils.isOrganizationNumber("916575319")).toBe(true);
      expect(validatorUtils.isOrganizationNumber("993110469")).toBe(true);
      expect(validatorUtils.isOrganizationNumber("891046642")).toBe(true);
      expect(validatorUtils.isOrganizationNumber("8 9 1 0 4 6 6 4 2")).toBe(true);
      expect(validatorUtils.isOrganizationNumber("889640782 ")).toBe(true);
      expect(validatorUtils.isOrganizationNumber(" 889640782")).toBe(true);
      expect(validatorUtils.isOrganizationNumber("889 640 782")).toBe(true);
    });

    it("Not valid control digit", () => {
      expect(validatorUtils.isOrganizationNumber("123456789")).toBe(false);
      expect(validatorUtils.isOrganizationNumber("987654321")).toBe(false);
      expect(validatorUtils.isOrganizationNumber("891046643")).toBe(false);
      expect(validatorUtils.isOrganizationNumber("789876546")).toBe(false);
      expect(validatorUtils.isOrganizationNumber("789634345")).toBe(false);
      expect(validatorUtils.isOrganizationNumber("389634347")).toBe(false);
      expect(validatorUtils.isOrganizationNumber("589634347")).toBe(false);
      expect(validatorUtils.isOrganizationNumber("539634347")).toBe(false);
      expect(validatorUtils.isOrganizationNumber("539634357")).toBe(false);
      expect(validatorUtils.isOrganizationNumber("839634357")).toBe(false);
    });

    it("Not valid symbols and spaces", () => {
      expect(validatorUtils.isOrganizationNumber("88964078")).toBe(false);
      expect(validatorUtils.isOrganizationNumber("8896407820")).toBe(false);
      expect(validatorUtils.isOrganizationNumber("889640782a")).toBe(false);
      expect(validatorUtils.isOrganizationNumber("8a9640782")).toBe(false);
      expect(validatorUtils.isOrganizationNumber("88964078 ")).toBe(false);
      expect(validatorUtils.isOrganizationNumber(" 89640782")).toBe(false);
      expect(validatorUtils.isOrganizationNumber("889.640.782")).toBe(false);
      expect(validatorUtils.isOrganizationNumber("NO889640782")).toBe(false);
      expect(validatorUtils.isOrganizationNumber("NO889640782MVA")).toBe(false);
    });
  });
});
