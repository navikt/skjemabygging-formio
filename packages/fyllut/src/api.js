import { get } from "@navikt/skjemadigitalisering-shared-components";
import { localizationUtils } from "@navikt/skjemadigitalisering-shared-domain";

const { getLanguageCodeAsIso639_1, zipCountryNames } = localizationUtils;

const loadCountryNames = async (locale) => {
  return get(`/fyllut/countries?lang=${getLanguageCodeAsIso639_1(locale)}`);
};

const loadGlobalTranslations = async (languageCode) => {
  return get(`/fyllut/global-translations/${languageCode}`);
};

export const loadFormTranslations = async (formPath) => {
  get(`/fyllut/translations/${formPath}`);
};

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
