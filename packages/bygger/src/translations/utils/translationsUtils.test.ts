import { getInputHeightInRows, removeDuplicatesAfterFirstMatch } from './translationsUtils';

describe('translationsUtils', () => {
  describe('removeDuplicatesAfterFirstMatch', () => {
    it('should return true for the first occurrence of each key', () => {
      const translations = [{ key: 'a' }, { key: 'b' }, { key: 'a' }, { key: 'c' }, { key: 'b' }];
      const result = translations.map(removeDuplicatesAfterFirstMatch);
      expect(result).toEqual([true, true, false, true, false]);
    });
  });

  describe('getInputHeightInRows', () => {
    it('should return 1 for an empty string', () => {
      const result = getInputHeightInRows('');
      expect(result).toBe(1);
    });

    it('should return 1 for a string shorter than the row size', () => {
      const result = getInputHeightInRows('short', 10);
      expect(result).toBe(1);
    });

    it('should return 2 for a string exactly equal to the row size', () => {
      const result = getInputHeightInRows('1234567890', 10);
      expect(result).toBe(2);
    });

    it('should return 3 for a string longer than twice the row size', () => {
      const result = getInputHeightInRows('12345678901234567890', 10);
      expect(result).toBe(3);
    });

    it('should use the default row size if not provided', () => {
      const result = getInputHeightInRows('a'.repeat(30));
      expect(result).toBe(2);
    });
  });
});
