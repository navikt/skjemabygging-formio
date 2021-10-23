import React, { useEffect, useState } from "react";
import { AmplitudeProvider, FyllUtRouter } from "@navikt/skjemadigitalisering-shared-components";

const loadCountryNames = async (locale) => {
  const getLanguageCodeAsIso639_1 = (locale) => {
    switch (locale) {
      case "nn-NO":
        return "nn";
      case "nb-NO":
        return "nb";
      default:
        return locale;
    }
  };
  return fetch(`https://www.nav.no/fyllut/countries?lang=${getLanguageCodeAsIso639_1(locale)}`).then((response) =>
    response.json()
  );
};

const zipCountryNames = (keyNames, valueNames) => {
  keyNames.sort((first, second) => first.value.localeCompare(second.value, "nb"));
  valueNames.sort((first, second) => first.value.localeCompare(second.value, "nb"));
  return keyNames.reduce(
    (acc, { label }, index) => ({
      ...acc,
      [label]: valueNames[index].label,
    }),
    {}
  );
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
            console.log(loadedCountryNames);
            const result = loadedCountryNames.reduce(
              (acc, countryNamesPerLocale, index) => ({
                ...acc,
                [localesInTranslations[index]]: zipCountryNames(countryNamesInBokmaal, countryNamesPerLocale),
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
