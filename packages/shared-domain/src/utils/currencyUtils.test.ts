import { currencyUtils } from '../index';

describe('currencyValidators', () => {
  describe('toLocaleString', () => {
    it('decimal', () => {
      expect(currencyUtils.toLocaleString(10)).toBe('kr\u00A010,00');
      expect(currencyUtils.toLocaleString('10')).toBe('kr\u00A010,00');
      expect(currencyUtils.toLocaleString('10.5')).toBe('kr\u00A010,50');
      expect(currencyUtils.toLocaleString('10.500000')).toBe('kr\u00A010,50');
      expect(currencyUtils.toLocaleString('10.504')).toBe('kr\u00A010,50');
    });

    it('integer', () => {
      expect(currencyUtils.toLocaleString(10, { integer: true })).toBe('kr\u00A010');
      expect(currencyUtils.toLocaleString(10.4, { integer: true })).toBe('kr\u00A010');
      expect(currencyUtils.toLocaleString(10.5, { integer: true })).toBe('kr\u00A011');
      expect(currencyUtils.toLocaleString('10', { integer: true })).toBe('kr\u00A010');
      expect(currencyUtils.toLocaleString('10.5', { integer: true })).toBe('kr\u00A011');
      expect(currencyUtils.toLocaleString('10.500000', { integer: true })).toBe('kr\u00A011');
      expect(currencyUtils.toLocaleString('10.504', { integer: true })).toBe('kr\u00A011');
      expect(currencyUtils.toLocaleString('1000', { integer: true })).toBe('kr\u00A01\u00A0000');
    });

    it('invalid currency', () => {
      expect(currencyUtils.toLocaleString('10,5')).toBe('10,5');
      expect(currencyUtils.toLocaleString('asdf')).toBe('asdf');
    });
  });
});
