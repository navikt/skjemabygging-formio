import React, { createContext, useContext, useEffect, useState } from "react";
import useLanguageCodeFromURL from "./useLanguageCodeFromURL";
import useCurrentLanguage from "./useCurrentLanguage";
import { mapTranslationsToFormioI18nObject } from "./translationsMapper";
import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";

const LanguagesContext = createContext({});

export const LanguagesProvider = ({ children, translations = {} }) => {
  const languageCodeFromUrl = useLanguageCodeFromURL();
  const availableLanguages = Object.keys(translations);
  const { currentLanguage, initialLanguage } = useCurrentLanguage(languageCodeFromUrl, translations);
  const [translationsForNavForm, setTranslationsForNavForm] = useState({});

  const currentTranslation = translations[currentLanguage] || {};

  useEffect(() => {
    const root = document.documentElement;
    if (currentTranslation && currentTranslation.optional) {
      root.style.setProperty("--optionalLabel", `" (${currentTranslation.optional})"`);
    } else {
      root.style.setProperty("--optionalLabel", `" (${TEXTS.common.optional})"`);
    }
  }, [currentTranslation]);

  useEffect(() => {
    if (availableLanguages.length > 0) {
      setTranslationsForNavForm(translations);
    }
  }, [translations]);

  function translate(originalText) {
    return currentTranslation[originalText] ? currentTranslation[originalText] : originalText;
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
