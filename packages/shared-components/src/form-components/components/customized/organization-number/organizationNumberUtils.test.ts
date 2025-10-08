import { formatOrganizationNumber } from './organizationNumberUtils';

describe('formatOrganizationNumber', () => {
  it('should format a valid organization number', () => {
    expect(formatOrganizationNumber('888888888')).toBe('888 888 888');
  });

  it('should return the input if not matching orgNrRegex', () => {
    expect(formatOrganizationNumber('invalid')).toBe('invalid');
  });

  it('should handle empty string', () => {
    expect(formatOrganizationNumber('')).toBe('');
  });
});
