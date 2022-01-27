import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { validateIBAN, ValidationErrorsIBAN } from "ibantools";
import IBAN from "./IBAN";

const { wrongBBANLength, noIBANCountry, invalidIBAN } = TEXTS.validering;

const iban = new IBAN();

jest.mock("ibantools", () => ({
  ...jest.requireActual("ibantools"),
  validateIBAN: jest.fn().mockReturnValue({ valid: true, errorCodes: [] }),
}));
jest.spyOn(IBAN.prototype, "getErrorMessage").mockImplementation((key) => TEXTS.validering[key]);

describe("IBAN", () => {
  describe("validateIban", () => {
    it("returns true if IBAN is valid", () => {
      expect(iban.validateIban("ValidIBAN")).toBe(true);
    });

    it("returns true when no IBAN is provided", () => {
      validateIBAN.mockReturnValue({ valid: false, errorCodes: [ValidationErrorsIBAN.NoIBANProvided] });
      expect(iban.validateIban("ValidIBAN")).toBe(true);
    });

    it("returns wrongBBANLength error message when BBAN part of IBAN has the wrong length", () => {
      validateIBAN.mockReturnValue({ valid: false, errorCodes: [ValidationErrorsIBAN.WrongBBANLength] });
      expect(iban.validateIban("ValidIBAN")).toBe(wrongBBANLength);
    });
    it("returns noIBANCountry error message when no country code is provided", () => {
      validateIBAN.mockReturnValue({ valid: false, errorCodes: [ValidationErrorsIBAN.NoIBANCountry] });
      expect(iban.validateIban("ValidIBAN")).toBe(noIBANCountry);
    });
    it("returns invalidIBAN error message when the IBAN is incorrect for other reasons", () => {
      validateIBAN.mockReturnValue({ valid: false, errorCodes: [99] });
      expect(iban.validateIban("ValidIBAN")).toBe(invalidIBAN);
    });
  });
});
