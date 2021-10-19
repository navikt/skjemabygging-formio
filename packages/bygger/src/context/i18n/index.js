import React, { createContext, useContext, useEffect, useState } from "react";
import { mapTranslationsToFormioI18nObject } from "@navikt/skjemadigitalisering-shared-components/src/context/languages/translationsMapper";

export const languagesInNorwegian = {
  "nn-NO": "Norsk nynorsk",
  en: "Engelsk",
  pl: "Polsk",
};

const I18nContext = createContext({});

function I18nProvider({ children, loadTranslations }) {
  const [translations, setTranslations] = useState({});
  const [currentTranslation, setCurrentTranslation] = useState({});
  const [translationsLoaded, setTranslationsLoaded] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState([]);

  useEffect(() => {
    if (!translationsLoaded) {
      setTranslationsLoaded(true);
      loadTranslations().then((translations) => {
        setAvailableLanguages(Object.keys(translations));
        setTranslations(translations);
      });
    }
  }, [loadTranslations, translationsLoaded]);

  const updateCurrentTranslation = (languageCode) => {
    const newTranslation = translations[languageCode] ? translations[languageCode].translations : {};
    setCurrentTranslation(newTranslation);
  };

  function translate(originalText) {
    return currentTranslation && currentTranslation[originalText]
      ? currentTranslation[originalText].value
      : originalText;
  }

  function hasComponentType(form, type) {
    const isAnyComponentOfType = (components) =>
      components?.some((component) => component.type === type || isAnyComponentOfType(component?.components));
    return form?.components ? isAnyComponentOfType(form?.components) : false;
  }

  function getTranslationsForNavForm(form) {
    const hasLandvelger = hasComponentType(form, "landvelger");
    const withoutCountryNames = (translation) => translation.scope !== "component-countryName";
    return mapTranslationsToFormioI18nObject(translations, hasLandvelger ? undefined : withoutCountryNames);
  }

  return (
    <I18nContext.Provider
      value={{
        translate,
        translations,
        getTranslationsForNavForm,
        setTranslations,
        updateCurrentTranslation,
        availableLanguages,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export const useTranslations = () => useContext(I18nContext);

export default I18nProvider;
