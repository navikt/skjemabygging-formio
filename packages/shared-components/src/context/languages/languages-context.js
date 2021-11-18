import React, { createContext, useContext, useEffect, useState } from "react";
import i18nData from "../../i18nData";
import useCurrentLanguage from "./useCurrentLanguage";
import useLanguageCodeFromURL from "./useLanguageCodeFromURL";

const LanguagesContext = createContext({});

export const LanguagesProvider = ({ children, translations }) => {
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [translationsForNavForm, setTranslationsForNavForm] = useState({});

  const languageCodeFromUrl = useLanguageCodeFromURL();
  const { currentLanguage, initialLanguage } = useCurrentLanguage(languageCodeFromUrl, translations);

  useEffect(() => {
    setAvailableLanguages(Object.keys(translations));
  }, [translations]);

  useEffect(() => {
    const languages = Object.keys(translations);
    const formTranslations = languages.reduce(
      (acc, language) => ({
        ...acc,
        [language]: translations[language],
      }),
      {}
    );
    setTranslationsForNavForm({
      ...formTranslations,
      "nb-NO": {
        ...formTranslations["nb-NO"],
        ...i18nData["nb-NO"],
      },
    });
  }, [translations]);

  function translate(originalText, params) {
    const currentTranslation = translations[currentLanguage];
    return currentTranslation && currentTranslation[originalText]
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
        translationsForNavForm,
      }}
    >
      {children}
    </LanguagesContext.Provider>
  );
};

export const useLanguages = () => useContext(LanguagesContext);
