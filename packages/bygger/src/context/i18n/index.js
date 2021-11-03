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
  const [translationsForNavForm, setTranslationsForNavForm] = useState({});
  const [countryNameTranslations, setCountryNameTranslations] = useState({});

  useEffect(() => {
    if (!translationsLoaded) {
      setTranslationsLoaded(true);
      loadTranslations().then((loadedTranslations) => {
        setAvailableLanguages(Object.keys(loadedTranslations));
        setTranslations(loadedTranslations);
      });
    }
  }, [loadTranslations, translationsLoaded]);

  useEffect(() => {
    const withoutCountryNames = (translation) => translation.scope !== "component-countryName";
    setTranslationsForNavForm(mapTranslationsToFormioI18nObject(translations, withoutCountryNames));
  }, [translations]);

  useEffect(() => {
    const countryNamesOnly = (translation) => translation.scope === "component-countryName";
    setCountryNameTranslations(mapTranslationsToFormioI18nObject(translations, countryNamesOnly));
  }, [translations]);

  const updateCurrentTranslation = (languageCode) => {
    const newTranslation = translations[languageCode] ? translations[languageCode].translations : {};
    setCurrentTranslation(newTranslation);
  };

  function translate(originalText) {
    return currentTranslation && currentTranslation[originalText]
      ? currentTranslation[originalText].value
      : originalText;
  }

  function getLocalTranslationsForNavForm() {
    const withoutCountryNames = (translation) =>
      translation.scope !== "component-countryName" && translation.scope !== "global";
    return mapTranslationsToFormioI18nObject(translations, withoutCountryNames);
  }

  return (
    <I18nContext.Provider
      value={{
        translate,
        translations,
        translationsForNavForm,
        countryNameTranslations,
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
