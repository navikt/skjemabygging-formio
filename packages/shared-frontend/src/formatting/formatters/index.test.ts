import { decimal, identityNumber, number, organizationNumber, phoneNumber } from './index';

describe('formatters', () => {
  it('formats identity number with a space after 6 digits', () => {
    expect(identityNumber('12345678901')).toBe('123456 78901');
    expect(identityNumber('123 456 78901')).toBe('123456 78901');
    expect(identityNumber('12345')).toBe('12345');
  });

  it('strips spaces from phone numbers', () => {
    expect(phoneNumber('12 34 56 78')).toBe('12345678');
  });

  it('formats organization number with grouped spaces', () => {
    expect(organizationNumber('889640782')).toBe('889 640 782');
    expect(organizationNumber('889 640 782')).toBe('889 640 782');
  });

  it('groups numbers with space as thousands separator', () => {
    expect(number('1234567')).toBe('1 234 567');
    expect(number('1 000')).toBe('1 000');
  });

  it('groups decimals and uses comma separator', () => {
    expect(decimal('1234.5')).toBe('1 234,5');
    expect(decimal('1 234,5')).toBe('1 234,5');
    expect(decimal('1000')).toBe('1 000');
  });

  it('passes partial or invalid input through ~unchanged (safe to run on every keystroke)', () => {
    // Formatters run onChange while typing, so a partial/invalid value must not be corrupted.
    expect(identityNumber('12ab')).toBe('12ab');
    expect(number('12ab')).toBe('12ab');
    expect(number('')).toBe('');
    expect(decimal('1,')).toBe('1,');
    expect(decimal('abc')).toBe('abc');
    expect(organizationNumber('12')).toBe('12');
  });

  it('is idempotent (formatting an already-formatted value is a no-op)', () => {
    expect(identityNumber(identityNumber('12345678901'))).toBe('123456 78901');
    expect(number(number('1234567'))).toBe('1 234 567');
    expect(decimal(decimal('1234.5'))).toBe('1 234,5');
    expect(organizationNumber(organizationNumber('889640782'))).toBe('889 640 782');
  });
});
