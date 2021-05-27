import React, { createContext, useContext } from "react";
import useLanguageCodeFromURL from "./useLanguageCodeFromURL";
import useCurrentLanguage from "./useCurrentLanguage";

const LanguagesContext = createContext({});

export const LanguagesProvider = ({ children, translations = {} }) => {
  const languageCodeFromUrl = useLanguageCodeFromURL();
  const availableLanguages = Object.keys(translations);
  const { currentLanguage, initialLanguage } = useCurrentLanguage(languageCodeFromUrl, translations);

  const currentTranslation = translations[currentLanguage] || {};

  function updateInitialLanguage() {
    initialLanguage.current = currentLanguage;
  }

  function translate(originalText) {
    return currentTranslation[originalText] ? currentTranslation[originalText].value : originalText;
  }

  return (
    <LanguagesContext.Provider
      value={{ availableLanguages, currentLanguage, initialLanguage, translate, updateInitialLanguage }}
    >
      {children}
    </LanguagesContext.Provider>
  );
};

export const useLanguages = () => useContext(LanguagesContext);
