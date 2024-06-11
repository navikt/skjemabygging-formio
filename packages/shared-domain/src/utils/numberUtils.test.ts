import numberUtils from './numberUtils';

describe('numberValidators', () => {
  describe('isValidDecimal', () => {
    it('valid decimals', () => {
      expect(numberUtils.isValidDecimal('-0.5')).toBe(true);
      expect(numberUtils.isValidDecimal('-0.1')).toBe(true);
      expect(numberUtils.isValidDecimal('0')).toBe(true);
      expect(numberUtils.isValidDecimal('1')).toBe(true);
      expect(numberUtils.isValidDecimal('1.5')).toBe(true);
      expect(numberUtils.isValidDecimal('1.12')).toBe(true);
      expect(numberUtils.isValidDecimal('123456789.0')).toBe(true);
    });

    it('invalid decimals', () => {
      expect(numberUtils.isValidDecimal('test')).toBe(false);
      expect(numberUtils.isValidDecimal('1.1a')).toBe(false);
      expect(numberUtils.isValidDecimal('1.1a')).toBe(false);
      expect(numberUtils.isValidDecimal('1.1.1')).toBe(false);
      expect(numberUtils.isValidDecimal('1.123')).toBe(false);
      // Comma is valid in NO, but we need to convert comma to dot before validating
      expect(numberUtils.isValidDecimal('1,1')).toBe(false);
    });

    it('except empty values to be invalid', () => {
      // @ts-ignore
      expect(numberUtils.isValidDecimal(undefined)).toBe(false);
      // @ts-ignore
      expect(numberUtils.isValidDecimal(null)).toBe(false);
      expect(numberUtils.isValidDecimal('')).toBe(false);
    });
  });

  describe('isValidInteger', () => {
    it('valid integer', () => {
      expect(numberUtils.isValidInteger('-5')).toBe(true);
      expect(numberUtils.isValidInteger('0')).toBe(true);
      expect(numberUtils.isValidInteger('5')).toBe(true);
      expect(numberUtils.isValidInteger('123456789')).toBe(true);
    });

    it('invalid integer', () => {
      expect(numberUtils.isValidInteger('test')).toBe(false);
      expect(numberUtils.isValidInteger('1.1')).toBe(false);
      expect(numberUtils.isValidInteger('1,1')).toBe(false);
      expect(numberUtils.isValidInteger('1a')).toBe(false);
    });

    it('except empty values to be invalid', () => {
      // @ts-ignore
      expect(numberUtils.isValidInteger(undefined)).toBe(false);
      // @ts-ignore
      expect(numberUtils.isValidInteger(null)).toBe(false);
      expect(numberUtils.isValidInteger('')).toBe(false);
    });
  });

  describe('isBiggerOrEqualMin', () => {
    it('empty min value is handled as no max', () => {
      expect(numberUtils.isBiggerOrEqualMin('10', '')).toBe(true);
      // @ts-ignore
      expect(numberUtils.isBiggerOrEqualMin('10', undefined)).toBe(true);
      // @ts-ignore
      expect(numberUtils.isBiggerOrEqualMin('10', null)).toBe(true);
    });

    it('bigger or equal -5', () => {
      expect(numberUtils.isBiggerOrEqualMin('-6', '-5')).toBe(false);
      expect(numberUtils.isBiggerOrEqualMin('-5.5', '-5')).toBe(false);
      expect(numberUtils.isBiggerOrEqualMin('-5', '-5')).toBe(true);
      expect(numberUtils.isBiggerOrEqualMin('0', '-5')).toBe(true);
      expect(numberUtils.isBiggerOrEqualMin('5', '-5')).toBe(true);
      expect(numberUtils.isBiggerOrEqualMin('5.5', '-5')).toBe(true);
      expect(numberUtils.isBiggerOrEqualMin('123456789', '-5')).toBe(true);
    });

    it('bigger or equal 0', () => {
      expect(numberUtils.isBiggerOrEqualMin('-6', '0')).toBe(false);
      expect(numberUtils.isBiggerOrEqualMin('-5.5', '0')).toBe(false);
      expect(numberUtils.isBiggerOrEqualMin('-5', '0')).toBe(false);
      expect(numberUtils.isBiggerOrEqualMin('0', '0')).toBe(true);
      expect(numberUtils.isBiggerOrEqualMin('5', '0')).toBe(true);
      expect(numberUtils.isBiggerOrEqualMin('5.5', '0')).toBe(true);
      expect(numberUtils.isBiggerOrEqualMin('123456789', '0')).toBe(true);
    });

    it('bigger or equal 5.5', () => {
      expect(numberUtils.isBiggerOrEqualMin('-6', '5.5')).toBe(false);
      expect(numberUtils.isBiggerOrEqualMin('-5.1', '5.5')).toBe(false);
      expect(numberUtils.isBiggerOrEqualMin('-5', '5.5')).toBe(false);
      expect(numberUtils.isBiggerOrEqualMin('0', '5.5')).toBe(false);
      expect(numberUtils.isBiggerOrEqualMin('5', '5.5')).toBe(false);
      expect(numberUtils.isBiggerOrEqualMin('5.5', '5.5')).toBe(true);
      expect(numberUtils.isBiggerOrEqualMin('6', '5.5')).toBe(true);
      expect(numberUtils.isBiggerOrEqualMin('123456789', '5.5')).toBe(true);
    });
  });

  describe('isSmallerOrEqualMax', () => {
    it('empty max value is handled as no max', () => {
      expect(numberUtils.isSmallerOrEqualMax('10', '')).toBe(true);
      // @ts-ignore
      expect(numberUtils.isSmallerOrEqualMax('10', undefined)).toBe(true);
      // @ts-ignore
      expect(numberUtils.isSmallerOrEqualMax('10', null)).toBe(true);
    });

    it('smaller or equal -5', () => {
      expect(numberUtils.isSmallerOrEqualMax('-6', '-5')).toBe(true);
      expect(numberUtils.isSmallerOrEqualMax('-5.5', '-5')).toBe(true);
      expect(numberUtils.isSmallerOrEqualMax('-5', '-5')).toBe(true);
      expect(numberUtils.isSmallerOrEqualMax('0', '-5')).toBe(false);
      expect(numberUtils.isSmallerOrEqualMax('5', '-5')).toBe(false);
      expect(numberUtils.isSmallerOrEqualMax('5.5', '-5')).toBe(false);
      expect(numberUtils.isSmallerOrEqualMax('123456789', '-5')).toBe(false);
    });

    it('smaller or equal 0', () => {
      expect(numberUtils.isSmallerOrEqualMax('-6', '0')).toBe(true);
      expect(numberUtils.isSmallerOrEqualMax('-5.5', '0')).toBe(true);
      expect(numberUtils.isSmallerOrEqualMax('-5', '0')).toBe(true);
      expect(numberUtils.isSmallerOrEqualMax('0', '0')).toBe(true);
      expect(numberUtils.isSmallerOrEqualMax('5', '0')).toBe(false);
      expect(numberUtils.isSmallerOrEqualMax('5.5', '0')).toBe(false);
      expect(numberUtils.isSmallerOrEqualMax('123456789', '0')).toBe(false);
    });

    it('smaller or equal 5.5', () => {
      expect(numberUtils.isSmallerOrEqualMax('-6', '5.5')).toBe(true);
      expect(numberUtils.isSmallerOrEqualMax('-5.1', '5.5')).toBe(true);
      expect(numberUtils.isSmallerOrEqualMax('-5', '5.5')).toBe(true);
      expect(numberUtils.isSmallerOrEqualMax('0', '5.5')).toBe(true);
      expect(numberUtils.isSmallerOrEqualMax('5', '5.5')).toBe(true);
      expect(numberUtils.isSmallerOrEqualMax('5.5', '5.5')).toBe(true);
      expect(numberUtils.isSmallerOrEqualMax('6', '5.5')).toBe(false);
      expect(numberUtils.isSmallerOrEqualMax('123456789', '5.5')).toBe(false);
    });
  });

  describe('toLocaleString', () => {
    it('normal', () => {
      expect(numberUtils.toLocaleString(10)).toBe('10');
      expect(numberUtils.toLocaleString('10')).toBe('10');
      expect(numberUtils.toLocaleString('10.5')).toBe('10,5');
      expect(numberUtils.toLocaleString('10.500000')).toBe('10,5');
      expect(numberUtils.toLocaleString('10.504')).toBe('10,5');
      expect(numberUtils.toLocaleString('10.5047')).toBe('10,5');
    });

    it('invalid numbers', () => {
      expect(numberUtils.toLocaleString('10,5')).toBe('10,5');
      expect(numberUtils.toLocaleString('asdf')).toBe('asdf');
    });
  });
});
