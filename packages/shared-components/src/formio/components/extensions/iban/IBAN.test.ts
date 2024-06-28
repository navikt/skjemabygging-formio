import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { validateIBAN, ValidationErrorsIBAN } from 'ibantools';
import { Mock } from 'vitest';
import IBAN from './IBAN.js';

const { wrongBBANLength, noIBANCountry, invalidIBAN } = TEXTS.validering;

const iban = new IBAN();

vi.mock('ibantools', async () => {
  const actual = await vi.importActual('ibantools');
  return {
    ...actual,
    validateIBAN: vi.fn().mockReturnValue({ valid: true, errorCodes: [] }),
  };
});
vi.spyOn(IBAN.prototype, 'getErrorMessage').mockImplementation((key) => TEXTS.validering[key]);

describe('IBAN', () => {
  describe('validateIban', () => {
    it('returns true if IBAN is valid', () => {
      expect(iban.validateIban('ValidIBAN')).toBe(true);
    });

    it('returns true when no IBAN is provided', () => {
      (validateIBAN as Mock).mockReturnValue({ valid: false, errorCodes: [ValidationErrorsIBAN.NoIBANProvided] });
      expect(iban.validateIban('ValidIBAN')).toBe(true);
    });

    it('returns wrongBBANLength error message when BBAN part of IBAN has the wrong length', () => {
      (validateIBAN as Mock).mockReturnValue({ valid: false, errorCodes: [ValidationErrorsIBAN.WrongBBANLength] });
      expect(iban.validateIban('ValidIBAN')).toBe(wrongBBANLength);
    });

    it('returns noIBANCountry error message when no country code is provided', () => {
      (validateIBAN as Mock).mockReturnValue({ valid: false, errorCodes: [ValidationErrorsIBAN.NoIBANCountry] });
      expect(iban.validateIban('ValidIBAN')).toBe(noIBANCountry);
    });

    it('returns invalidIBAN error message when the IBAN is incorrect for other reasons', () => {
      (validateIBAN as Mock).mockReturnValue({ valid: false, errorCodes: [99] });
      expect(iban.validateIban('ValidIBAN')).toBe(invalidIBAN);
    });
  });
});
