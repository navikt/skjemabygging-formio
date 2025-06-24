import {
  formatAccountNumber,
  formatIBAN,
  formatNationalIdentityNumber,
  formatNumber,
  formatOrganizationNumber,
  removeAllSpaces,
} from './format-utils';

describe('format-utils', () => {
  describe('removeAllSpaces', () => {
    it('should remove all spaces from a string', () => {
      expect(removeAllSpaces('123 456 789')).toBe('123456789');
      expect(removeAllSpaces(' 123  456 ')).toBe('123456');
      expect(removeAllSpaces('')).toBe('');
    });
  });

  describe('formatIBAN', () => {
    it('should format IBAN by adding spaces every 4 characters', () => {
      expect(formatIBAN('1234567890123456')).toBe('1234 5678 9012 3456 ');
      expect(formatIBAN('1234')).toBe('1234 ');
      expect(formatIBAN('')).toBe('');
    });
  });

  describe('formatAccountNumber', () => {
    it('should format a bank account number with spaces', () => {
      expect(formatAccountNumber('12345678901')).toBe('1234 56 78901');
      expect(formatAccountNumber('1234')).toBe('1234');
      expect(formatAccountNumber('')).toBe('');
    });
  });

  describe('formatCurrency', () => {
    it('should format a number as currency with two decimal places by default', () => {
      expect(formatNumber('1234.5', false)).toBe('1\u00A0234,50');
      expect(formatNumber('1234', false)).toBe('1\u00A0234,00');
    });

    it('should format a number as an integer when isInteger is true', () => {
      expect(formatNumber('1234.5', true)).toBe('1\u00A0235');
      expect(formatNumber('1234', true)).toBe('1\u00A0234');
    });

    it('should return the original value if it is not a valid number', () => {
      expect(formatNumber('invalid', false)).toBe('invalid');
      expect(formatNumber('', false)).toBe('');
    });
  });

  describe('formatNationalIdentityNumber', () => {
    it('should format a national identity number with a space after the first 6 digits', () => {
      expect(formatNationalIdentityNumber('12345678901')).toBe('123456 78901');
      expect(formatNationalIdentityNumber('123456')).toBe('123456');
      expect(formatNationalIdentityNumber('')).toBe('');
    });
  });

  describe('formatOrganizationNumber', () => {
    it('should format an organization number with spaces after every 3 digits', () => {
      expect(formatOrganizationNumber('123456789')).toBe('123 456 789');
      expect(formatOrganizationNumber('123')).toBe('123');
      expect(formatOrganizationNumber('')).toBe('');
    });
  });
});
