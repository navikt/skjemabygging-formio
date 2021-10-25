import React, { createContext, useContext } from "react";
import useLanguageCodeFromURL from "./useLanguageCodeFromURL";
import useCurrentLanguage from "./useCurrentLanguage";

const LanguagesContext = createContext({});

export const LanguagesProvider = ({ children, translations = {}, countryNameTranslations = {} }) => {
  const languageCodeFromUrl = useLanguageCodeFromURL();
  const availableLanguages = Object.keys(translations);
  const { currentLanguage, initialLanguage } = useCurrentLanguage(languageCodeFromUrl, translations);

  function getTranslationsForNavForm() {
    return availableLanguages.reduce(
      (acc, language) => ({
        ...acc,
        [language]: {
          ...translations[language],
          ...countryNameTranslations[language],
        },
      }),
      {}
    );
  }

  function getCurrentTranslation() {
    return {
      ...translations[currentLanguage],
      ...countryNameTranslations[currentLanguage],
    };
  }

  function translate(originalText, params) {
    const currentTranslation = getCurrentTranslation();
    return currentTranslation[originalText]
      ? injectParams(currentTranslation[originalText], params)
      : injectParams(originalText, params);
  }

  const injectParams = (template, params) => {
    if (template && params) {
      return template.replace(/{{2}([^{}]*)}{2}/g, (match, $1) => translate(params[$1]) || match);
    }
    return template;
  };

  return (
    <LanguagesContext.Provider
      value={{
        availableLanguages,
        currentLanguage,
        initialLanguage,
        translate,
        getTranslationsForNavForm,
      }}
    >
      {children}
    </LanguagesContext.Provider>
  );
};

export const useLanguages = () => useContext(LanguagesContext);
