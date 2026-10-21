import { validateFormTranslations, validateGlobalTranslations } from './inputValidation';

describe('validateFormTranslations', () => {
  it.each([undefined, '', ' \n\t '])('rejects missing Bokmål on key-based translations: %j', (nb) => {
    expect(validateFormTranslations([{ key: 'intro-key', tag: 'introPage', nb }])).toEqual([
      expect.objectContaining({ key: 'intro-key', type: 'MISSING_BOKMAL_VALIDATION' }),
    ]);
  });

  it('accepts non-empty Bokmål without requiring other languages', () => {
    expect(validateFormTranslations([{ key: 'intro-key', tag: 'introPage', nb: ' Welcome ' }])).toEqual([]);
  });

  it('preserves text-based and global translation validation', () => {
    expect(validateFormTranslations([{ key: 'Source text', nb: '' }])).toEqual([]);
    expect(validateGlobalTranslations([{ key: 'introPage.scope.title.alt1', nb: '' }])).toEqual([]);
    expect(validateFormTranslations([{ key: 'intro-key', tag: 'introPage', nb: 'x'.repeat(5121) }])).toEqual([
      expect.objectContaining({ type: 'INPUT_TOO_LONG_VALIDATION' }),
    ]);
  });
});
