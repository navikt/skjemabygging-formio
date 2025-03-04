import { currencyUtils } from '../index';

describe('currencyValidators', () => {
  describe('toLocaleString', () => {
    it('decimal', () => {
      expect(currencyUtils.toLocaleString(10)).toBe('10,00\u00A0kr');
      expect(currencyUtils.toLocaleString('10')).toBe('10,00\u00A0kr');
      expect(currencyUtils.toLocaleString('10.5')).toBe('10,50\u00A0kr');
      expect(currencyUtils.toLocaleString('10.500000')).toBe('10,50\u00A0kr');
      expect(currencyUtils.toLocaleString('10.504')).toBe('10,50\u00A0kr');
    });

    it('integer', () => {
      expect(currencyUtils.toLocaleString(10, { integer: true })).toBe('10\u00A0kr');
      expect(currencyUtils.toLocaleString(10.4, { integer: true })).toBe('10\u00A0kr');
      expect(currencyUtils.toLocaleString(10.5, { integer: true })).toBe('11\u00A0kr');
      expect(currencyUtils.toLocaleString('10', { integer: true })).toBe('10\u00A0kr');
      expect(currencyUtils.toLocaleString('10.5', { integer: true })).toBe('11\u00A0kr');
      expect(currencyUtils.toLocaleString('10.500000', { integer: true })).toBe('11\u00A0kr');
      expect(currencyUtils.toLocaleString('10.504', { integer: true })).toBe('11\u00A0kr');
      expect(currencyUtils.toLocaleString('1000', { integer: true })).toBe('1\u00A0000\u00A0kr');
    });

    it('invalid currency', () => {
      expect(currencyUtils.toLocaleString('10,5')).toBe('10,5');
      expect(currencyUtils.toLocaleString('asdf')).toBe('asdf');
    });
  });
});
