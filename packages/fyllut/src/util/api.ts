import { getCountries } from '@navikt/skjemadigitalisering-shared-components';
import { localizationUtils } from '@navikt/skjemadigitalisering-shared-domain';
import httpFyllut from './httpFyllut';

const { zipCountryNames } = localizationUtils;

const loadCountryNames = async (locale) => {
  return getCountries(locale);
};

const loadGlobalTranslations = async (languageCode) => {
  return httpFyllut.get(`/fyllut/api/global-translations/${languageCode}`);
};

export const loadFormTranslations = async (formPath) => {
  return httpFyllut.get(`/fyllut/api/translations/${formPath}`);
};

export const loadCountryNamesForLanguages = async (languages) => {
  if (languages.length === 0) {
    return Promise.resolve({});
  }
  const countryNamesInBokmaal = await loadCountryNames('nb-NO');
  return Promise.all(languages.map(loadCountryNames)).then((loadedCountryNames) =>
    loadedCountryNames.reduce(
      (acc, countryNamesPerLocale, index) => ({
        ...acc,
        [languages[index]]: zipCountryNames(
          countryNamesInBokmaal,
          countryNamesPerLocale,
          (countryName) => countryName.label,
        ),
      }),
      {},
    ),
  );
};

export const loadGlobalTranslationsForLanguages = async (languages) =>
  Promise.all(languages.map(loadGlobalTranslations)).then((allGlobalTranslations) =>
    allGlobalTranslations.reduce(
      (accumulated, translationsForLanguage) => ({
        ...accumulated,
        ...Object.keys(translationsForLanguage).reduce(
          (translations, lang) => ({ ...translations, [lang]: { ...translationsForLanguage[lang] } }),
          {},
        ),
      }),
      {},
    ),
  );
