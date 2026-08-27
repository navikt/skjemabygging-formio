import { getCountries, i18nUtils } from '@navikt/skjemadigitalisering-shared-components';
import { externalStorageTexts, I18nTranslations, localizationUtils } from '@navikt/skjemadigitalisering-shared-domain';
import httpFyllut from '../util/httpFyllut';

const { zipCountryNames } = localizationUtils;

const loadCountryNames = async (locale) => {
  return getCountries(locale);
};

const loadGlobalTranslations = async (languageCode) => {
  return httpFyllut.get(`/fyllut/api/global-translations/${languageCode}`);
};

const loadFormTranslations = async (formPath) => {
  return httpFyllut.get(`/fyllut/api/translations/${formPath}`);
};

const loadCountryNamesForLanguages = async (languages) => {
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

const loadGlobalTranslationsForLanguages = async (languages) =>
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

const loadAllTranslations = async (formPath): Promise<I18nTranslations | undefined> => {
  const localTranslationsForForm: any = await loadFormTranslations(formPath);
  const availableLanguages = Object.keys(localTranslationsForForm);
  const countryNameTranslations = await loadCountryNamesForLanguages(availableLanguages);
  const initValuesForKeyBasedGlobalTranslations = i18nUtils.mapFormsApiTranslationsToI18n(
    externalStorageTexts.initValues.introPage,
  );
  const globalTranslations = await loadGlobalTranslationsForLanguages(['nb-NO', ...availableLanguages]);

  const initValues = {
    'nb-NO': {
      ...i18nUtils.initialData['nb-NO'],
      ...initValuesForKeyBasedGlobalTranslations['nb-NO'],
    },
  };
  const allTranslations = availableLanguages.reduce(
    (accumulated, lang) => ({
      ...accumulated,
      [lang]: {
        ...accumulated[lang],
        ...countryNameTranslations[lang],
        ...initValuesForKeyBasedGlobalTranslations[lang],
        ...globalTranslations[lang],
        ...localTranslationsForForm[lang],
      },
    }),
    initValues,
  );
  if (Object.keys(allTranslations).length > 0) {
    return allTranslations;
  }
};

export { loadAllTranslations, loadGlobalTranslationsForLanguages };
