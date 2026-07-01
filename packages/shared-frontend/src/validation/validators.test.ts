import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { validateValue } from './validators';

describe('validateValue', () => {
  it('returns required violation for empty value', () => {
    expect(validateValue('', 'Name', { required: true })).toEqual({
      textKey: TEXTS.validering.required,
      params: { field: 'Name' },
    });
  });

  it('passes required when value is present', () => {
    expect(validateValue('John', 'Name', { required: true })).toBeUndefined();
  });

  it('flags too short values', () => {
    expect(validateValue('ab', 'Name', { minLength: 3 })).toEqual({
      textKey: TEXTS.validering.minLength,
      params: { field: 'Name', length: 3 },
    });
  });

  it('flags too long values', () => {
    expect(validateValue('abcd', 'Name', { maxLength: 3 })).toEqual({
      textKey: TEXTS.validering.maxLength,
      params: { field: 'Name', length: 3 },
    });
  });

  it('returns undefined when no rules violated', () => {
    expect(validateValue('abc', 'Name', { required: true, minLength: 2, maxLength: 5 })).toBeUndefined();
  });
});
