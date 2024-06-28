import translationUtils from './translation';

const translations = {
  singleReplacement: 'You must fill in: {{field1}}',
  multipleReplacement: 'You must fill in: {{field1}} and {{field2}}',
  noReplacement: 'No replacements',
};

const translationsWithLanguageCode = {
  en: {
    singleReplacement: 'You must fill in: {{field1}}',
  },
  'nb-NO': {
    singleReplacement: 'Du må fylle ut: {{field1}}',
  },
};

const textReplacements = {
  field1: 'replacedField',
  field2: 'anotherReplacedField',
};

describe('translation', () => {
  describe('translateWithTextReplacements function', () => {
    it('should return translated text with replacements', () => {
      expect(
        translationUtils.translateWithTextReplacements({
          translations,
          originalText: 'singleReplacement',
          params: textReplacements,
        }),
      ).toBe('You must fill in: replacedField');
    });

    it('should return translated text with no replacements', () => {
      expect(
        translationUtils.translateWithTextReplacements({
          translations,
          originalText: 'noReplacement',
          params: textReplacements,
        }),
      ).toBe('No replacements');
    });

    it('should return original text if translation not found', () => {
      expect(
        translationUtils.translateWithTextReplacements({
          translations,
          originalText: 'This text is not translated',
          params: textReplacements,
        }),
      ).toBe('This text is not translated');
    });

    it('should handle multiple replacements in the same text', () => {
      const translatedText = translationUtils.translateWithTextReplacements({
        translations,
        originalText: 'Replace {{field1}} and {{field2}}',
        params: textReplacements,
      });
      expect(translatedText).toBe('Replace replacedField and anotherReplacedField');
    });

    it('should handle missing replacements gracefully', () => {
      const translatedText = translationUtils.translateWithTextReplacements({
        translations,
        originalText: 'Replace {{field1}} and {{nonExistentField}}',
        params: textReplacements,
      });
      expect(translatedText).toBe('Replace replacedField and {{nonExistentField}}');
    });

    it('should ignore extra fields in the text replacements object', () => {
      const extraReplacements = {
        field1: 'replacedField',
        field2: 'anotherReplacedField',
        field3: 'unusedReplacement',
      };
      expect(
        translationUtils.translateWithTextReplacements({
          translations,
          originalText: 'singleReplacement',
          params: extraReplacements,
        }),
      ).toBe('You must fill in: replacedField');
    });

    it('should replace all occurrences of the same placeholder', () => {
      const translationsWithRepeatedPlaceholder = {
        repeatedPlaceholder: 'Replace {{field1}} with {{field1}}',
      };
      const translatedText = translationUtils.translateWithTextReplacements({
        translations: translationsWithRepeatedPlaceholder,
        originalText: 'repeatedPlaceholder',
        params: textReplacements,
      });
      expect(translatedText).toBe('Replace replacedField with replacedField');
    });
  });

  describe('translateWithTextReplacements function with currentLanguage', () => {
    it('should return translated text with replacements', () => {
      expect(
        translationUtils.translateWithTextReplacements({
          translations: translationsWithLanguageCode,
          originalText: 'singleReplacement',
          params: textReplacements,
          currentLanguage: 'en',
        }),
      ).toBe('You must fill in: replacedField');

      expect(
        translationUtils.translateWithTextReplacements({
          translations: translationsWithLanguageCode,
          originalText: 'singleReplacement',
          params: textReplacements,
          currentLanguage: 'nb-NO',
        }),
      ).toBe('Du må fylle ut: replacedField');
    });
  });
});
