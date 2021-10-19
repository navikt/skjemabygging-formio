import React, { createContext, useContext, useEffect, useState } from "react";
import useLanguageCodeFromURL from "./useLanguageCodeFromURL";
import useCurrentLanguage from "./useCurrentLanguage";

const LanguagesContext = createContext({});

export const LanguagesProvider = ({ children, translations = {} }) => {
  const languageCodeFromUrl = useLanguageCodeFromURL();
  const availableLanguages = Object.keys(translations);
  const { currentLanguage, initialLanguage } = useCurrentLanguage(languageCodeFromUrl, translations);
  const [translationsForNavForm, setTranslationsForNavForm] = useState({});

  const currentTranslation = translations[currentLanguage] || {};

  useEffect(() => {
    if (availableLanguages.length > 0) {
      setTranslationsForNavForm(translations);
    }
  }, [translations]);

  function translate(originalText, params) {
    return currentTranslation[originalText]
      ? injectParams(currentTranslation[originalText], params)
      : injectParams(originalText, params);
  }

  const injectParams = (template, params) => {
    if (template && params) {
      return template.replace(/{{([^}]*)}}/g, (match, $1) => translate(params[$1]) || match);
    }
    return template;
  }

  return (
    <LanguagesContext.Provider
      value={{
        availableLanguages,
        currentLanguage,
        initialLanguage,
        translate,
        translationsForNavForm,
      }}
    >
      {children}
    </LanguagesContext.Provider>
  );
};

export const useLanguages = () => useContext(LanguagesContext);
