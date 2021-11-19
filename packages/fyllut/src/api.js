import { localizationUtils } from "@navikt/skjemadigitalisering-shared-domain";

const { getLanguageCodeAsIso639_1, zipCountryNames } = localizationUtils;

const loadCountryNames = async (locale) => {
  return fetch(`/fyllut/countries?lang=${getLanguageCodeAsIso639_1(locale)}`).then((response) => response.json());
};

const loadGlobalTranslations = async (languageCode) => {
  return fetch(`/fyllut/global-translations/${languageCode}`, {
    headers: { accept: "application/json" },
  }).then((response) => response.json());
};

export const loadFormTranslations = async (formPath) =>
  fetch(`/fyllut/translations/${formPath}`, { headers: { accept: "application/json" } }).then((response) =>
    response.json()
  );

export const loadCountryNamesForLanguages = async (languages) => {
  if (languages.length === 0) {
    return Promise.resolve({});
  }
  const countryNamesInBokmaal = await loadCountryNames("nb-NO");
  return Promise.all(languages.map(loadCountryNames)).then((loadedCountryNames) =>
    loadedCountryNames.reduce(
      (acc, countryNamesPerLocale, index) => ({
        ...acc,
        [languages[index]]: zipCountryNames(
          countryNamesInBokmaal,
          countryNamesPerLocale,
          (countryName) => countryName.label
        ),
      }),
      {}
    )
  );
};

export const loadGlobalTranslationsForLanguages = async (languages) =>
  Promise.all(languages.map(loadGlobalTranslations)).then((allGlobalTranslations) =>
    allGlobalTranslations.reduce(
      (accumulated, translationsForLanguage) => ({
        ...accumulated,
        ...Object.keys(translationsForLanguage).reduce(
          (translations, lang) => ({ ...translations, [lang]: { ...translationsForLanguage[lang] } }),
          {}
        ),
      }),
      {}
    )
  );
