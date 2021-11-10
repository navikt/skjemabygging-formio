import React, { useEffect, useState } from "react";
import {
  AmplitudeProvider,
  FyllUtRouter,
  i18nData,
  useAppConfig
} from "@navikt/skjemadigitalisering-shared-components";
import { localizationUtils } from "@navikt/skjemadigitalisering-shared-domain";

const { getLanguageCodeAsIso639_1, zipCountryNames } = localizationUtils;

const loadCountryNames = async (locale) => {
  return fetch(`/fyllut/countries?lang=${getLanguageCodeAsIso639_1(locale)}`).then((response) => response.json());
};

const loadGlobalTranslations = async (languageCode) => {
  return fetch(`/fyllut/global-translations/${languageCode}`, {headers: {accept: "application/json"}}).then((response) => response.json());
};

function FormPage({ form }) {
  const [translation, setTranslation] = useState({});
  const [ready, setReady] = useState(false);
  const { featureToggles } = useAppConfig();

  useEffect(() => {
    if (featureToggles.enableTranslations) {
      fetch(`/fyllut/translations/${form.path}`, {headers: {accept: "application/json"}}).then((response) => {
        response
          .json()
          .then(async (localTranslationsForForm) => {
            const availableLanguages = Object.keys(localTranslationsForForm);
            const countryNamesInBokmaal = await loadCountryNames("nb-NO");
            return Promise.all(availableLanguages.map(loadCountryNames)).then((loadedCountryNames) => {
              return loadedCountryNames.reduce(
                (acc, countryNamesPerLocale, index) => ({
                  ...acc,
                  [availableLanguages[index]]: zipCountryNames(
                    countryNamesInBokmaal,
                    countryNamesPerLocale,
                    (countryName) => countryName.label
                  ),
                }),
                {}
              );
            }).then(async (countryNameTranslations) => {

              await Promise.all(availableLanguages.map(loadGlobalTranslations)).then(allGlobalTranslations => {
                const completeGlobalTranslations = allGlobalTranslations.reduce((accumulated, translationsForLanguage) => {
                  return {
                    ...accumulated,
                    ...Object.keys(translationsForLanguage).reduce((translations, lang) => (
                      {...translations, [lang]: {...translationsForLanguage[lang]}}
                    ), {})
                  }
                }, {});

                const completeI18n = availableLanguages
                  .reduce((accumulated, lang) => ({
                    ...accumulated,
                    [lang]: {
                      ...accumulated[lang],
                      ...countryNameTranslations[lang],
                      ...completeGlobalTranslations[lang],
                      ...localTranslationsForForm[lang]
                    }
                  }), availableLanguages.length > 0 ? {"nb-NO": i18nData["nb-NO"]} : {});

                setTranslation(completeI18n);
                setReady(true);
              });
            });

          });
      });
    } else {
      setReady(true);
    }
  }, [form, featureToggles.enableTranslations]);

  if (!ready) {
    return <div>Laster skjema...</div>
  }
  return (
    <AmplitudeProvider form={form} shouldUseAmplitude={true}>
      <FyllUtRouter form={form} translations={translation} />
    </AmplitudeProvider>
  );
}

export default FormPage;
