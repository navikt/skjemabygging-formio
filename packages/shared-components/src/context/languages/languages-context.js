import React, { createContext, useContext, useEffect, useState } from "react";
import useLanguageCodeFromURL from "./useLanguageCodeFromURL";
import useCurrentLanguage from "./useCurrentLanguage";
import i18nData from "../../i18nData";

const LanguagesContext = createContext({});

export const LanguagesProvider = ({ children, translations, countryNameTranslations }) => {
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [translationsForNavForm, setTranslationsForNavForm] = useState({});

  const languageCodeFromUrl = useLanguageCodeFromURL();
  const { currentLanguage, initialLanguage } = useCurrentLanguage(languageCodeFromUrl, translations);

  useEffect(() => {
    console.log("useLanguages1");
    setAvailableLanguages(Object.keys(translations));
  }, [translations]);

  useEffect(() => {
    console.log("useLanguages2");
    const languages = Object.keys(translations);
    const formTranslations = languages.reduce(
      (acc, language) => ({
        ...acc,
        [language]: {
          ...translations[language],
          ...countryNameTranslations[language],
        },
      }),
      {}
    );
    console.log("translations", translations);
    setTranslationsForNavForm({
      ...formTranslations,
      "nb-NO": {
        ...formTranslations["nb-NO"],
        ...i18nData["nb-NO"],
      },
    });
  }, [translations, countryNameTranslations]);

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
        translationsForNavForm,
      }}
    >
      {children}
    </LanguagesContext.Provider>
  );
};

export const useLanguages = () => useContext(LanguagesContext);
