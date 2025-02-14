import localizationUtils from './localization';

describe('localization', () => {
  describe('getLanguageCodeAsIso639_1', () => {
    it('maps nn-NO to nn', () => {
      expect(localizationUtils.getLanguageCodeAsIso639_1('nn-NO')).toBe('nn');
    });

    it('maps nn to nn', () => {
      expect(localizationUtils.getLanguageCodeAsIso639_1('nn')).toBe('nn');
    });

    it('maps nb-NO to nb', () => {
      expect(localizationUtils.getLanguageCodeAsIso639_1('nb-NO')).toBe('nb');
    });

    it('maps nb to nb', () => {
      expect(localizationUtils.getLanguageCodeAsIso639_1('nb')).toBe('nb');
    });

    it('maps en to en', () => {
      expect(localizationUtils.getLanguageCodeAsIso639_1('en')).toBe('en');
    });
  });

  describe('zipCountryNames', () => {
    const countryNames1 = [
      { label: 'Country1', value: 'X1' },
      { label: 'Country2', value: 'X2' },
      { label: 'Country3', value: 'X3' },
      { label: 'Country4', value: 'X4' },
    ];
    const countryNames2 = [
      { label: 'CountryC', value: 'X3' },
      { label: 'CountryB', value: 'X2' },
      { label: 'CountryD', value: 'X4' },
      { label: 'CountryA', value: 'X1' },
    ];

    it('returns an object combined of the arrays where value is used as identifier', () => {
      expect(
        localizationUtils.zipCountryNames(countryNames1, countryNames2, (countryName) => countryName.label),
      ).toStrictEqual({
        Country1: 'CountryA',
        Country2: 'CountryB',
        Country3: 'CountryC',
        Country4: 'CountryD',
      });
    });
  });
});
