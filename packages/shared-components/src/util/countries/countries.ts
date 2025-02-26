import { ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import countries, { LocalizedCountryNames } from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import nbLocale from 'i18n-iso-countries/langs/nb.json';
import nnLocale from 'i18n-iso-countries/langs/nn.json';

type LanguageType = 'en' | 'nn' | 'nn-NO' | 'nb' | 'nb-NO';

const compareAscending = (a: string, b: string, locale: string) => a.localeCompare(b, locale);

const getCountries = (lang: LanguageType = 'nb') => {
  let countriesMap: LocalizedCountryNames<{ select: 'official' }>;
  switch (lang) {
    case 'nb':
    case 'nb-NO':
      countries.registerLocale(nbLocale);
      countriesMap = countries.getNames('nb');
      break;
    case 'nn':
    case 'nn-NO':
      countries.registerLocale(nnLocale);
      countriesMap = countries.getNames('nn');
      break;
    default:
      countries.registerLocale(enLocale);
      countriesMap = countries.getNames('en');
  }

  return Object.entries(countriesMap)
    .map(([key, value]) => ({ label: value, value: key }))
    .sort((a, b) => compareAscending(a.label.toUpperCase(), b.label.toUpperCase(), lang));
};

const getCountryObject = (countryCode: string, language: LanguageType = 'nb'): ComponentValue | undefined => {
  const countryList = getCountries(language);

  if (countryCode.length === 3) {
    countryCode = countries.alpha3ToAlpha2(countryCode) ?? countryCode;
  }

  return countryList?.find((option) => option.value === countryCode);
};

export { getCountries, getCountryObject };
