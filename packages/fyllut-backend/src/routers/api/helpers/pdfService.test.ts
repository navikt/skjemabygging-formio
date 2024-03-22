import { translateWithTextReplacements } from './pdfService';

const translations = {
  singleReplacement: 'You must fill in: {{field1}}',
  multipleReplacement: 'You must fill in: {{field1}} and {{field2}}',
  noReplacement: 'No replacements',
};

const textReplacements = {
  field1: 'replacedField',
  field2: 'anotherReplacedField',
};

describe('translateWithTextReplacements function', () => {
  it('should return translated text with replacements', () => {
    expect(translateWithTextReplacements(translations, 'singleReplacement', textReplacements)).toBe(
      'You must fill in: replacedField',
    );
  });

  it('should return translated text with no replacements', () => {
    expect(translateWithTextReplacements(translations, 'noReplacement', textReplacements)).toBe('No replacements');
  });

  it('should return original text if translation not found', () => {
    expect(translateWithTextReplacements(translations, 'This text is not translated', textReplacements)).toBe(
      'This text is not translated',
    );
  });

  it('should handle multiple replacements in the same text', () => {
    const translatedText = translateWithTextReplacements(
      translations,
      'Replace {{field1}} and {{field2}}',
      textReplacements,
    );
    expect(translatedText).toBe('Replace replacedField and anotherReplacedField');
  });

  it('should handle missing replacements gracefully', () => {
    const translatedText = translateWithTextReplacements(
      translations,
      'Replace {{field1}} and {{nonExistentField}}',
      textReplacements,
    );
    expect(translatedText).toBe('Replace replacedField and {{nonExistentField}}');
  });
});
