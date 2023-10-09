import countries from 'i18n-iso-countries';

const compareAscending = (a, b, locale) => a.localeCompare(b, locale);

export function getCountries(lang = 'nb') {
  const countriesMap = countries.getNames(lang);
  return Object.entries(countriesMap)
    .map(([key, value]) => ({ label: value, value: key }))
    .sort((a, b) => compareAscending(a.label.toUpperCase(), b.label.toUpperCase(), lang));
}
