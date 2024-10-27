import { getCountries } from './countries';

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

const getCountryLabel = (countries, countryCode) => {
  const country = countries.find((country: { value: string; label: string }) => country.value === countryCode);

  if (country) {
    return country.label;
  }
};
