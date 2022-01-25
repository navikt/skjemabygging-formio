import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import Fodselsnummer from "./Fodselsnummer";

describe("Fodselsnummer", () => {
  describe("validering", () => {
    let fnrComp;

    beforeEach(() => {
      fnrComp = new Fodselsnummer();
      jest.spyOn(Fodselsnummer.prototype, "t").mockImplementation((text) => text);
    });

    it("successfully validates a fnr", () => {
      expect(fnrComp.validateFnr("13097248022")).toBe(true);
      expect(fnrComp.validateFnrNew("13097248022")).toBe(true);
    });

    it("successfully validates empty fnr", () => {
      expect(fnrComp.validateFnr("")).toBe(true);
      expect(fnrComp.validateFnrNew("")).toBe(true);
    });

    it("fails validation for invalid fnr", () => {
      expect(fnrComp.validateFnr("13097248023")).toBe(false);
      expect(fnrComp.validateFnrNew("13097248023")).toEqual(TEXTS.validering.fodselsnummerDNummer);
    });

    it("successfully validates a fnr containing space", () => {
      expect(fnrComp.validateFnr("130972 48022")).toBe(true);
      expect(fnrComp.validateFnrNew("130972 48022")).toBe(true);
    });

    it("successfully validates a dnr", () => {
      expect(fnrComp.validateFnr("53097248016")).toBe(true);
      expect(fnrComp.validateFnrNew("53097248016")).toBe(true);
    });

    it("fails validation for 12345678911", () => {
      expect(fnrComp.validateFnr("12345678911")).toBe(false);
      expect(fnrComp.validateFnrNew("12345678911")).toEqual(TEXTS.validering.fodselsnummerDNummer);
    });

    it("fails validation for 00000000000", () => {
      expect(fnrComp.validateFnr("00000000000")).toBe(false);
      expect(fnrComp.validateFnrNew("00000000000")).toEqual(TEXTS.validering.fodselsnummerDNummer);
    });
  });
});
