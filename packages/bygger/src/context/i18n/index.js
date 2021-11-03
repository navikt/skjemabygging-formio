import React, { createContext, useContext, useEffect, useState } from "react";
import { mapTranslationsToFormioI18nObject } from "@navikt/skjemadigitalisering-shared-components";

export const languagesInNorwegian = {
  "nn-NO": "Norsk nynorsk",
  en: "Engelsk",
  pl: "Polsk",
};

const I18nContext = createContext({});

function I18nProvider({ children, loadTranslations }) {
  const [translations, setTranslations] = useState({});
  const [currentTranslation, setCurrentTranslation] = useState({});
  const [translationsLoaded, setTranslationsLoaded] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState([]);

  useEffect(() => {
    if (!translationsLoaded) {
      setTranslationsLoaded(true);
      loadTranslations().then((loadedTranslations) => {
        setAvailableLanguages(Object.keys(loadedTranslations));
        setTranslations(loadedTranslations);
      });
    }
  }, [loadTranslations, translationsLoaded]);

  const updateCurrentTranslation = (languageCode) => {
    const newTranslation = translations[languageCode] ? translations[languageCode].translations : {};
    setCurrentTranslation(newTranslation);
  };

  function translate(originalText) {
    return currentTranslation && currentTranslation[originalText]
      ? currentTranslation[originalText].value
      : originalText;
  }

  function getTranslationsForNavForm() {
    const withoutCountryNames = (translation) => translation.scope !== "component-countryName";
    return mapTranslationsToFormioI18nObject(translations, withoutCountryNames);
  }

  function getLocalTranslationsForNavForm() {
    const withoutCountryNames = (translation) =>
      translation.scope !== "component-countryName" && translation.scope !== "global";
    return mapTranslationsToFormioI18nObject(translations, withoutCountryNames);
  }

  function getCountryNameTranslations() {
    const countryNamesOnly = (translation) => translation.scope === "component-countryName";
    return mapTranslationsToFormioI18nObject(translations, countryNamesOnly);
  }

  return (
    <I18nContext.Provider
      value={{
        translate,
        translations,
        getTranslationsForNavForm,
        getCountryNameTranslations,
        setTranslations,
        updateCurrentTranslation,
        availableLanguages,
        getLocalTranslationsForNavForm,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export const useTranslations = () => useContext(I18nContext);

export default I18nProvider;
