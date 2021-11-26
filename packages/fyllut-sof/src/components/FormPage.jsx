import React, { useEffect, useState } from "react";
import { FyllUtRouter } from "@navikt/skjemadigitalisering-shared-components";
import { localizationUtils } from "@navikt/skjemadigitalisering-shared-domain";
import { useFhirContext } from "./FhirContext";
import { mapper } from "../mapping/mapper";

const { getLanguageCodeAsIso639_1, zipCountryNames } = localizationUtils;

const loadCountryNames = async (locale) => {
  return fetch(`/fyllut/countries?lang=${getLanguageCodeAsIso639_1(locale)}`).then((response) => response.json());
};

function FormPage({ form }) {
  const [translation, setTranslation] = useState({});
  const [countryNameTranslations, setCountryNameTranslations] = useState({});
  const { patient, user } = useFhirContext();

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

  if (patient && user) {
    const mappedForm = mapper(form, patient, user);
    return (
      <FyllUtRouter form={mappedForm} translations={translation} countryNameTranslations={countryNameTranslations} />
    );
  } else {
    return <div>loading</div>;
  }
}

export default FormPage;
