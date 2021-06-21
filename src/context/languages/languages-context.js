import React, { createContext, useContext, useEffect } from "react";
import useLanguageCodeFromURL from "./useLanguageCodeFromURL";
import useCurrentLanguage from "./useCurrentLanguage";

const LanguagesContext = createContext({});

export const LanguagesProvider = ({ children, translations = {} }) => {
  const languageCodeFromUrl = useLanguageCodeFromURL();
  const availableLanguages = Object.keys(translations);
  const { currentLanguage, initialLanguage } = useCurrentLanguage(languageCodeFromUrl, translations);

  const currentTranslation = translations[currentLanguage] ? translations[currentLanguage].translations : {};

  useEffect(() => {
    const root = document.documentElement;
    if (currentTranslation && currentTranslation.optional) {
      root.style.setProperty("--optionalLabel", `" (${currentTranslation.optional.value})"`);
    } else {
      root.style.setProperty("--optionalLabel", `" (valgfritt)"`);
    }
  }, [currentTranslation]);

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
