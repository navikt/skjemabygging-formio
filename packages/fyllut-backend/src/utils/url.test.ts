import { describe, expect, it } from 'vitest';
import { isValidPath } from './url';

describe('isValidPath', () => {
  it('accepts alphanumeric paths', () => {
    expect(isValidPath('stdigital')).toBe(true);
    expect(isValidPath('nav083501')).toBe(true);
  });

  it('accepts hyphenated paths', () => {
    expect(isValidPath('submission-type-digital-no-login')).toBe(true);
  });

  it('rejects paths with illegal characters', () => {
    expect(isValidPath('../etc/passwd')).toBe(false);
    expect(isValidPath('form with space')).toBe(false);
    expect(isValidPath('FORM')).toBe(false);
  });
});
