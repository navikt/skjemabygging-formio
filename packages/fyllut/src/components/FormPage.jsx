import React, { useEffect, useState } from "react";
import { AmplitudeProvider, FyllUtRouter } from "@navikt/skjemadigitalisering-shared-components";
import { localizationUtils } from "@navikt/skjemadigitalisering-shared-domain";

const { getLanguageCodeAsIso639_1, zipCountryNames } = localizationUtils;

const loadCountryNames = async (locale) => {
  return fetch(`/fyllut/countries?lang=${getLanguageCodeAsIso639_1(locale)}`).then((response) => response.json());
};

function FormPage({ form }) {
  const [translation, setTranslation] = useState({});
  const [countryNameTranslations, setCountryNameTranslations] = useState({});

  useEffect(() => {
    fetch(`/fyllut/translations/${form.path}`, { headers: { accept: "application/json" } }).then((response) => {
      response
        .json()
        .then((loadedTranslations) => {
          setTranslation(loadedTranslations);
          return loadedTranslations;
        })
        .then(async (loadedTranslations) => {
          const localesInTranslations = Object.keys(loadedTranslations);
          const countryNamesInBokmaal = await loadCountryNames("nb-NO");
          await Promise.all(localesInTranslations.map(loadCountryNames)).then((loadedCountryNames) => {
            const result = loadedCountryNames.reduce(
              (acc, countryNamesPerLocale, index) => ({
                ...acc,
                [localesInTranslations[index]]: zipCountryNames(
                  countryNamesInBokmaal,
                  countryNamesPerLocale,
                  (countryName) => countryName.label
                ),
              }),
              {}
            );
            setCountryNameTranslations(result);
          });
        });
    });
  }, [form]);
  return (
    <AmplitudeProvider form={form} shouldUseAmplitude={true}>
      <FyllUtRouter form={form} translations={translation} countryNameTranslations={countryNameTranslations} />
    </AmplitudeProvider>
  );
}

export default FormPage;
