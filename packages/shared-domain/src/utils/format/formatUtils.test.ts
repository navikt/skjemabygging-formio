import { describe } from 'vitest';
import { formatUtils } from './formatUtils';

describe('format-utils', () => {
  describe('removeAllSpaces', () => {
    it('should remove all spaces from a string', () => {
      expect(formatUtils.removeAllSpaces('123 456 789')).toBe('123456789');
      expect(formatUtils.removeAllSpaces(' 123  456 ')).toBe('123456');
      expect(formatUtils.removeAllSpaces('')).toBe('');
    });
  });

  describe('formatIBAN', () => {
    it('should format IBAN by adding spaces every 4 characters', () => {
      expect(formatUtils.formatIBAN('1234567890123456')).toBe('1234 5678 9012 3456 ');
      expect(formatUtils.formatIBAN('1234')).toBe('1234 ');
      expect(formatUtils.formatIBAN('')).toBe('');
    });
  });

  describe('formatAccountNumber', () => {
    it('should format a bank account number with spaces', () => {
      expect(formatUtils.formatAccountNumber('12345678901')).toBe('1234 56 78901');
      expect(formatUtils.formatAccountNumber('1234')).toBe('1234');
      expect(formatUtils.formatAccountNumber('')).toBe('');
    });
  });

  describe('formatCurrency', () => {
    it('should format a number as currency with two decimal places by default', () => {
      expect(formatUtils.formatNumber('1234.5', false)).toBe('1\u00A0234,50');
      expect(formatUtils.formatNumber('1234', false)).toBe('1\u00A0234,00');
    });

    it('should format a number as an integer when isInteger is true', () => {
      expect(formatUtils.formatNumber('1234.5', true)).toBe('1\u00A0235');
      expect(formatUtils.formatNumber('1234', true)).toBe('1\u00A0234');
    });

    it('should return the original value if it is not a valid number', () => {
      expect(formatUtils.formatNumber('invalid', false)).toBe('invalid');
      expect(formatUtils.formatNumber('', false)).toBe('');
    });
  });

  describe('formatNationalIdentityNumber', () => {
    it('should format a national identity number with a space after the first 6 digits', () => {
      expect(formatUtils.formatNationalIdentityNumber('12345678901')).toBe('123456 78901');
      expect(formatUtils.formatNationalIdentityNumber('123456')).toBe('123456');
      expect(formatUtils.formatNationalIdentityNumber('')).toBe('');
    });
  });

  describe('formatOrganizationNumber', () => {
    it('should format an organization number with spaces after every 3 digits', () => {
      expect(formatUtils.formatOrganizationNumber('123456789')).toBe('123 456 789');
      expect(formatUtils.formatOrganizationNumber('123')).toBe('123');
      expect(formatUtils.formatOrganizationNumber('')).toBe('');
    });
  });

  describe('format phone number', () => {
    it('should format phone number with +47 area code', () => {
      expect(formatUtils.formatPhoneNumber('12345678', '+47')).toBe('12 34 56 78');
      expect(formatUtils.formatPhoneNumber('12345678', '+49')).toBe('12345678');
      expect(formatUtils.formatPhoneNumber('', '')).toBe('');
    });
  });
});
