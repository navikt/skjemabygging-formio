import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import FormioDefaultTranslations from "formiojs/i18n";
import GlobalTranslations from "../../i18nData";

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

const mapTranslationsToFormioI18nObject = (translations) => {
  return Object.keys(translations).reduce(
    (formioI18nObject, languageCode) => ({
      ...formioI18nObject,
      resources: {
        ...formioI18nObject.resources,
        [languageCode]: {
          ...(formioI18nObject.resources[languageCode] || {}),
          translation: {
            ...((formioI18nObject.resources[languageCode] && formioI18nObject.resources[languageCode].translation) ||
              {}),
            ...Object.keys(translations[languageCode].translations || {}).reduce(
              (translationsForLanguageCode, originalText) => ({
                ...translationsForLanguageCode,
                [originalText]: translations[languageCode].translations[originalText].value,
              }),
              {}
            ),
          },
        },
      },
    }),
    {
      ...FormioDefaultTranslations,
      resources: {
        ...FormioDefaultTranslations.resources,
        ...Object.keys(GlobalTranslations).reduce(
          (languages, languageCode) => ({
            ...languages,
            [languageCode]: {
              ...((FormioDefaultTranslations.resources && FormioDefaultTranslations.resources[languageCode]) || {}),
              translation: {
                ...((FormioDefaultTranslations.resources &&
                  FormioDefaultTranslations.resources[languageCode] &&
                  FormioDefaultTranslations.resources[languageCode].translation) ||
                  {}),
                ...GlobalTranslations[languageCode],
              },
            },
          }),
          {}
        ),
      },
    }
  );
};

const I18nContext = createContext({});

function I18nProvider({ children, loadTranslations }) {
  const { languageCode } = useParams();
  const history = useHistory();
  const params = new URLSearchParams(history.location.search);
  const langQueryParam = params.get("lang");
  // useRef does not change on re-runs, so this just uses the language set when loading the app,
  // either by setting the lang query param or defaulting to bokmal (nb-NO)
  const languageCodeFromUrl = langQueryParam || languageCode;
  const initialLanguage = useRef(
    supportedLanguages.indexOf(languageCodeFromUrl) !== -1 ? languageCodeFromUrl : "nb-NO"
  );
  const [translations, setTranslations] = useState({});
  const [translationsForNavForm, setTranslationsForNavForm] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState(initialLanguage.current);
  const [currentTranslation, setCurrentTranslation] = useState({});

  useEffect(() => {
    if (languageCodeFromUrl) {
      setCurrentLanguage(languageCodeFromUrl);
    }
  }, [languageCodeFromUrl]);

  useEffect(() => {
    if (langQueryParam && supportedLanguages.indexOf(langQueryParam) !== -1) {
      setCurrentLanguage(langQueryParam);
    }
  }, [langQueryParam, setCurrentLanguage]);

  useEffect(() => {
    loadTranslations().then((translations) => {
      setTranslations(translations);
      setTranslationsForNavForm(mapTranslationsToFormioI18nObject(translations));
    });
  }, [loadTranslations]);

  useEffect(() => {
    const newTranslation = translations[currentLanguage] ? translations[currentLanguage].translations : {};
    setCurrentTranslation(newTranslation);
  }, [currentLanguage, translations]);

  useEffect(() => {
    if (window.setLanguage !== undefined) {
      window.setLanguage(currentLanguage);
    }
  }, [currentLanguage]);

  function translate(originalText) {
    return currentTranslation && currentTranslation[originalText]
      ? currentTranslation[originalText].value
      : originalText;
  }

  function updateInitialLanguage() {
    initialLanguage.current = currentLanguage;
  }

  return (
    <I18nContext.Provider
      value={{
        availableLanguages: Object.keys(translations),
        currentLanguage,
        initialLanguage,
        translate,
        translations,
        translationsForNavForm,
        setTranslations,
        setCurrentLanguage,
        updateInitialLanguage,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export const useTranslations = () => useContext(I18nContext);

export default I18nProvider;
