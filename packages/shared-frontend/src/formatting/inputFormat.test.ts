import { toInputFormat, toSubmissionFormat, toSubmissionNumber } from './inputFormat';

describe('inputFormat', () => {
  it('returns empty string for null/undefined', () => {
    expect(toInputFormat(undefined)).toBe('');
    expect(toInputFormat(null)).toBe('');
  });

  it('passes through when no formatter', () => {
    expect(toInputFormat('abc')).toBe('abc');
    expect(toSubmissionFormat('abc')).toBe('abc');
  });

  it('trims surrounding whitespace', () => {
    expect(toInputFormat('  abc  ')).toBe('abc');
    expect(toSubmissionFormat('  abc  ')).toBe('abc');
    expect(toSubmissionFormat('   ')).toBe('');
  });

  it('applies a known formatter both ways', () => {
    expect(toInputFormat('1234567', 'number')).toBe('1 234 567');
    expect(toSubmissionFormat('1 234 567', 'number')).toBe('1 234 567');
  });

  it('supports different input and submission formats for account numbers', () => {
    expect(toInputFormat('12345678901', 'accountNumber')).toBe('1234 56 78901');
    expect(toSubmissionFormat('1234 56 78901', 'accountNumber')).toBe('12345678901');
  });

  it('supports different input and submission formats for iban', () => {
    expect(toInputFormat('NO9386011117947', 'iban')).toBe('NO93 8601 1117 947');
    expect(toSubmissionFormat('NO93 8601 1117 947', 'iban')).toBe('NO9386011117947');
  });

  it('converts a valid whole number, ignoring spaces', () => {
    expect(toSubmissionNumber('2023', true)).toBe(2023);
    expect(toSubmissionNumber('1 234 567', true)).toBe(1234567);
    expect(toSubmissionNumber('-12', true)).toBe(-12);
  });

  it('converts a valid decimal number with a decimal comma', () => {
    expect(toSubmissionNumber('1 234,5', false)).toBe(1234.5);
    expect(toSubmissionNumber('12.5', false)).toBe(12.5);
  });

  it('does not convert empty or invalid numbers', () => {
    expect(toSubmissionNumber('', true)).toBeUndefined();
    expect(toSubmissionNumber('20a', true)).toBeUndefined();
    expect(toSubmissionNumber('12,5', true)).toBeUndefined();
    expect(toSubmissionNumber('', false)).toBeUndefined();
  });
});
