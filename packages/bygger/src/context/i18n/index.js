import { i18nData, mapTranslationsToFormioI18nObject } from "@navikt/skjemadigitalisering-shared-components";
import React, { createContext, useContext, useEffect, useState } from "react";

export const languagesInNorwegian = {
  "nn-NO": "Norsk nynorsk",
  en: "Engelsk",
  pl: "Polsk",
};

const I18nContext = createContext({});

function I18nProvider({ children, loadTranslations, forGlobal = false }) {
  const [translations, setTranslations] = useState({});
  const [translationsLoaded, setTranslationsLoaded] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [translationsForNavForm, setTranslationsForNavForm] = useState({});
  const [localTranslationsForNavForm, setLocalTranslationsForNavForm] = useState({});

  useEffect(() => {
    if (!translationsLoaded) {
      setTranslationsLoaded(true);
      loadTranslations().then((loadedTranslations) => {
        setAvailableLanguages(Object.keys(loadedTranslations));
        if (!forGlobal) {
          setTranslations(loadedTranslations);
        }
      });
    }
  }, [loadTranslations, translationsLoaded, forGlobal]);

  useEffect(() => {
    const i18n = mapTranslationsToFormioI18nObject(translations);
    setTranslationsForNavForm({
      ...i18n,
      "nb-NO": {
        ...i18n["nb-NO"],
        ...i18nData["nb-NO"],
      },
    });
  }, [translations]);

  useEffect(() => {
    const withoutCountryNames = (translation) =>
      translation.scope !== "component-countryName" && translation.scope !== "global";
    setLocalTranslationsForNavForm(mapTranslationsToFormioI18nObject(translations, withoutCountryNames));
  }, [translations]);

  return (
    <I18nContext.Provider
      value={{
        translations,
        translationsForNavForm,
        setTranslations,
        availableLanguages,
        localTranslationsForNavForm,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export const useTranslations = () => useContext(I18nContext);

export default I18nProvider;
