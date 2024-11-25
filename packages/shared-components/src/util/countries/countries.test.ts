import { getCountries, getCountryObject } from './countries';

describe('countries', () => {
  describe('getCountries', () => {
    it('gets country names in bokmål by default', () => {
      const countries = getCountries();
      expect(getCountryLabel(countries, 'NO')).toEqual('Norge');
    });

    it('gets country names in bokmål', () => {
      const countries = getCountries('nb-NO');
      expect(getCountryLabel(countries, 'NO')).toEqual('Norge');
    });

    it('gets country names in nynorsk', () => {
      const countries = getCountries('nn-NO');
      expect(getCountryLabel(countries, 'NO')).toEqual('Noreg');
    });

    it('gets country names in english', () => {
      const countries = getCountries('en');
      expect(getCountryLabel(countries, 'NO')).toEqual('Norway');
    });
  });

  describe('getCountryObject', () => {
    it('Return empty with unknown countr code', () => {
      expect(getCountryObject('BEEP')).toBeUndefined();
    });

    it('Support alpha 2 code', () => {
      expect(getCountryObject('BN')).toEqual({ label: 'Brunei', value: 'BN' });
    });

    it('Support alpha 3 code', () => {
      expect(getCountryObject('BRN')).toEqual({ label: 'Brunei', value: 'BN' });
    });
  });
});

const getCountryLabel = (countries, countryCode) => {
  const country = countries.find((country: { value: string; label: string }) => country.value === countryCode);

  if (country) {
    return country.label;
  }
};
