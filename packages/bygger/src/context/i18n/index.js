import React, { createContext, useContext, useEffect, useState } from "react";
import { mapTranslationsToFormioI18nObject } from "@navikt/skjemadigitalisering-shared-components/src/context/languages/translationsMapper";

export const supportedLanguages = ["nb-NO", "nn-NO", "en", "pl"];
export const languagesInNorwegian = {
  "nb-NO": "Norsk bokmål",
  "nn-NO": "Norsk nynorsk",
  en: "Engelsk",
  pl: "Polsk",
};

const I18nContext = createContext({});

function I18nProvider({ children, loadTranslations }) {
  const [translations, setTranslations] = useState({});
  const [translationsForNavForm, setTranslationsForNavForm] = useState(null);
  const [currentTranslation, setCurrentTranslation] = useState({});
  const [translationsLoaded, setTranslationsLoaded] = useState(false);

  useEffect(() => {
    if (!translationsLoaded) {
      setTranslationsLoaded(true);
      loadTranslations().then((translations) => {
        setTranslations(translations);
        setTranslationsForNavForm(mapTranslationsToFormioI18nObject(translations));
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

  return (
    <I18nContext.Provider
      value={{
        translate,
        translations,
        translationsForNavForm,
        setTranslations,
        updateCurrentTranslation,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export const useTranslations = () => useContext(I18nContext);

export default I18nProvider;
