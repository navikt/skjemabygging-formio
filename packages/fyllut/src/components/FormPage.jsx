import {
  AmplitudeProvider,
  FyllUtRouter,
  i18nData,
  LoadingComponent,
  useAppConfig,
} from "@navikt/skjemadigitalisering-shared-components";
import React, { useEffect, useState } from "react";
import { loadCountryNamesForLanguages, loadFormTranslations, loadGlobalTranslationsForLanguages } from "../api";
import httpFyllut from "../util/httpFyllut";

function FormPage({ form }) {
  const [translation, setTranslation] = useState({});
  const [ready, setReady] = useState(false);
  const { featureToggles } = useAppConfig();
  useEffect(() => {
    async function fetchTranslations() {
      if (featureToggles.enableTranslations) {
        const localTranslationsForForm = await loadFormTranslations(form.path);
        const availableLanguages = Object.keys(localTranslationsForForm);
        const countryNameTranslations = await loadCountryNamesForLanguages(availableLanguages);
        const globalTranslations = await loadGlobalTranslationsForLanguages(availableLanguages);

        try {
          const test = await httpFyllut.get("/fyllut/api/pdl/person/02824298087");
          console.log(test);
        } catch (e) {
          console.log(e);
        }

        return availableLanguages.reduce(
          (accumulated, lang) => ({
            ...accumulated,
            [lang]: {
              ...accumulated[lang],
              ...countryNameTranslations[lang],
              ...globalTranslations[lang],
              ...localTranslationsForForm[lang],
            },
          }),
          { "nb-NO": i18nData["nb-NO"] }
        );
      } else {
        return {};
      }
    }
    fetchTranslations().then((completeI18n) => {
      setReady(true);
      if (Object.keys(completeI18n).length > 0) {
        setTranslation(completeI18n);
      }
    });
  }, [form, featureToggles.enableTranslations]);

  if (!ready) {
    return <LoadingComponent />;
  }

  return (
    <AmplitudeProvider form={form} shouldUseAmplitude={true}>
      <FyllUtRouter form={form} translations={translation} />
    </AmplitudeProvider>
  );
}

export default FormPage;
