import { toInputFormat, toSubmissionFormat } from './inputFormat';

describe('inputFormat', () => {
  it('returns empty string for null/undefined', () => {
    expect(toInputFormat(undefined)).toBe('');
    expect(toInputFormat(null)).toBe('');
  });

  it('passes through when no formatter', () => {
    expect(toInputFormat('abc')).toBe('abc');
    expect(toSubmissionFormat('abc')).toBe('abc');
  });

  it('applies a known formatter both ways', () => {
    expect(toInputFormat('1234567', 'number')).toBe('1 234 567');
    expect(toSubmissionFormat('1 234 567', 'number')).toBe('1 234 567');
  });
});
