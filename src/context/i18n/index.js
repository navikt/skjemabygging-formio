import React, { createContext, useContext, useEffect, useState } from "react";

const I18nContext = createContext({});

function I18nProvider({ children, loadTranslations }) {
  const [translations, setTranslations] = useState({ resources: {} });
  const [languageCode, setCurrentLanguage] = useState("nb-NO");
  const [currentTranslation, setCurrentTranslation] = useState({});

  useEffect(() => {
    loadTranslations().then((translations) => {
      setTranslations(translations);
    });
  }, [loadTranslations]);

  useEffect(() => {
    const newTranslation = translations.resources[languageCode] ? translations.resources[languageCode].translation : {};
    setCurrentTranslation(newTranslation);
  }, [languageCode, translations]);

  function translate(originalText) {
    return currentTranslation[originalText] || originalText;
  }

  return (
    <I18nContext.Provider
      value={{
        availableLanguages: Object.keys(translations.resources),
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
