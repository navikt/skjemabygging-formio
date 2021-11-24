import React, { createContext, useContext, useEffect, useState } from "react";
import { mapTranslationsToFormioI18nObject, i18nData } from "@navikt/skjemadigitalisering-shared-components";
import {getFormTexts} from "../../translations/utils";

export const languagesInNorwegian = {
  "nn-NO": "Norsk nynorsk",
  en: "Engelsk",
  pl: "Polsk",
};

const I18nContext = createContext({});

const extractDefaultI18nNbNoFormTexts = form => {
  // i18n for nb-NO texts as a workaround to bug https://github.com/formio/formio.js/issues/4465
  return form
    ? getFormTexts(form).reduce((i18n, formText) => ({...i18n, [formText.text]: formText.text}), {})
    : {}
};

function I18nProvider({ children, loadTranslations, forGlobal = false, form }) {
  const [translations, setTranslations] = useState({});
  const [currentTranslation, setCurrentTranslation] = useState({});
  const [translationsLoaded, setTranslationsLoaded] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [translationsForNavForm, setTranslationsForNavForm] = useState({});
  const [localTranslationsForNavForm, setLocalTranslationsForNavForm] = useState({});

  useEffect(() => {
    if (!translationsLoaded) {
      setTranslationsLoaded(true);
      loadTranslations().then((loadedTranslations) => {
        setAvailableLanguages(Object.keys(loadedTranslations));
        if (!forGlobal) {
          setTranslations(loadedTranslations);
        }
      });
    }
  }, [loadTranslations, translationsLoaded, forGlobal]);

  useEffect(() => {
    const i18n = mapTranslationsToFormioI18nObject(translations);
    let nbNoI18nFormTexts = extractDefaultI18nNbNoFormTexts(form);
    setTranslationsForNavForm({
      ...i18n,
      "nb-NO": {
        ...i18n["nb-NO"],
        ...i18nData["nb-NO"],
        ...nbNoI18nFormTexts
      }
    });
  }, [translations]);

  useEffect(() => {
    const withoutCountryNames = (translation) =>
      translation.scope !== "component-countryName" && translation.scope !== "global";
    setLocalTranslationsForNavForm(mapTranslationsToFormioI18nObject(translations, withoutCountryNames));
  }, [translations]);

  const updateCurrentTranslation = (languageCode) => {
    const newTranslation = translations[languageCode] ? translations[languageCode].translations : {};
    setCurrentTranslation(newTranslation);
  };

  function translate(originalText) {
    return currentTranslation && currentTranslation[originalText]
      ? currentTranslation[originalText].value
      : originalText;
  }

  return (
    <I18nContext.Provider
      value={{
        translate,
        translations,
        translationsForNavForm,
        setTranslations,
        updateCurrentTranslation,
        availableLanguages,
        localTranslationsForNavForm,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export const useTranslations = () => useContext(I18nContext);

export default I18nProvider;
