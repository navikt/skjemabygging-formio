import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";

export const supportedLanguages = ["nb-NO", "nn-NO", "en", "pl"];
export const languagesInNorwegian = {
  "nb-NO": "Norsk bokmål",
  "nn-NO": "Norsk nynorsk",
  en: "Engelsk",
  pl: "Polsk",
};
export const languagesInOriginalLanguage = {
  "nb-NO": "Norsk bokmål",
  "nn-NO": "Norsk nynorsk",
  en: "English",
  pl: "Polskie",
};

const I18nContext = createContext({});

function I18nProvider({ children, loadTranslations }) {
  const [translations, setTranslations] = useState({ resources: {} });
  const [languageCode, setCurrentLanguage] = useState("nb-NO");
  const [currentTranslation, setCurrentTranslation] = useState({});

  const history = useHistory();
  const params = new URLSearchParams(history.location.search);
  const langQueryParam = params.get("lang");
  // useRef does not change on re-runs, so this just uses the language set when loading the app,
  // either by setting the lang query param or defaulting to bokmal (nb-NO)
  const initialLanguage = useRef(
    langQueryParam && supportedLanguages.indexOf(langQueryParam) !== -1 ? langQueryParam : "nb-NO"
  );

  useEffect(() => {
    if (langQueryParam && supportedLanguages.indexOf(langQueryParam) !== -1) {
      setCurrentLanguage(langQueryParam);
    }
  }, [langQueryParam, setCurrentLanguage]);

  useEffect(() => {
    loadTranslations().then((translations) => {
      setTranslations(translations);
    });
  }, [loadTranslations]);

  useEffect(() => {
    const newTranslation = translations.resources[languageCode] ? translations.resources[languageCode].translation : {};
    setCurrentTranslation(newTranslation);
  }, [languageCode, translations]);

  useEffect(() => {
    if (window.setLanguage !== undefined) {
      window.setLanguage(languageCode);
    }
  }, [languageCode]);

  function translate(originalText) {
    console.log(`Translating ${originalText}`, currentTranslation);
    return currentTranslation[originalText] || originalText;
  }

  return (
    <I18nContext.Provider
      value={{
        availableLanguages: Object.keys(translations.resources),
        currentLanguage: languageCode,
        initialLanguage,
        translate,
        translations,
        setTranslations,
        setCurrentLanguage,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export const useTranslations = () => useContext(I18nContext);

export default I18nProvider;
