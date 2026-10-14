import { ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import countries, { LocalizedCountryNames } from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import nbLocale from 'i18n-iso-countries/langs/nb.json';
import nnLocale from 'i18n-iso-countries/langs/nn.json';

const compareAscending = (a: string, b: string, locale: string) => a.localeCompare(b, locale);

const getCountryLocale = (language: string) => {
  if (language === 'en' || language === 'en-US') {
    countries.registerLocale(enLocale);
    return 'en';
  }

  if (language === 'nn' || language === 'nn-NO') {
    countries.registerLocale(nnLocale);
    return 'nn';
  }

  countries.registerLocale(nbLocale);
  return 'nb';
};

const getCountries = (language: string = 'nb'): ComponentValue[] => {
  const locale = getCountryLocale(language);
  const countriesMap: LocalizedCountryNames<{ select: 'official' }> = countries.getNames(locale);

  return Object.entries(countriesMap)
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => compareAscending(a.label.toUpperCase(), b.label.toUpperCase(), locale));
};

const getCountryObject = (countryCode: string, language: string = 'nb'): ComponentValue | undefined => {
  const normalizedCountryCode =
    countryCode.length === 3 ? (countries.alpha3ToAlpha2(countryCode) ?? countryCode) : countryCode;

  return getCountries(language).find((option) => option.value === normalizedCountryCode);
};

export { getCountries, getCountryObject };
