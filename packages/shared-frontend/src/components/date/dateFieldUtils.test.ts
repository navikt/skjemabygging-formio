import { describe, expect, it } from 'vitest';
import { toDatePickerInputValue } from './dateFieldUtils';

describe('dateFieldUtils', () => {
  describe('toDatePickerInputValue', () => {
    it('formats submission dates as dd.MM.yyyy', () => {
      expect(toDatePickerInputValue('2025-06-01')).toBe('01.06.2025');
    });

    it('keeps typed input values unchanged', () => {
      expect(toDatePickerInputValue('01.06.2025')).toBe('01.06.2025');
    });
  });
});
