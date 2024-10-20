import localizationUtils from './localization';

describe('localization', () => {
  describe('getLanguageCodeAsIso639_1', () => {
    it('maps nn-NO to nn', () => {
      expect(localizationUtils.getLanguageCodeAsIso639_1('nn-NO')).toBe('nn');
    });

    it('maps nb-NO to nb', () => {
      expect(localizationUtils.getLanguageCodeAsIso639_1('nb-NO')).toBe('nb');
    });

    it('maps en to en', () => {
      expect(localizationUtils.getLanguageCodeAsIso639_1('en')).toBe('en');
    });
  });
});
