import { decimal, identityNumber, number, phoneNumber } from './index';

describe('formatters', () => {
  it('formats identity number with a space after 6 digits', () => {
    expect(identityNumber('12345678901')).toBe('123456 78901');
    expect(identityNumber('123 456 78901')).toBe('123456 78901');
    expect(identityNumber('12345')).toBe('12345');
  });

  it('strips spaces from phone numbers', () => {
    expect(phoneNumber('12 34 56 78')).toBe('12345678');
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
});
