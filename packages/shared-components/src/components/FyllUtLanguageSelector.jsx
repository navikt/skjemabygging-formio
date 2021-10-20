import React from "react";
import LanguageSelector from "./LanguageSelector";
import { useLanguages } from "../context/languages";

export const languagesInOriginalLanguage = {
  "nb-NO": "Norsk bokmål",
  "nn-NO": "Norsk nynorsk",
  en: "English",
  pl: "Polskie",
};

const FyllUtLanguageSelector = () => {
  const { currentLanguage, availableLanguages } = useLanguages();
  if (availableLanguages.length === 0) {
    return null;
  }
  const options = availableLanguages.map((languageCode) => ({
    languageCode,
    optionLabel: languagesInOriginalLanguage[languageCode],
    href: `?lang=${languageCode}`,
  }));

  const label = languagesInOriginalLanguage[currentLanguage]
    ? languagesInOriginalLanguage[currentLanguage]
    : "Norsk bokmål";

  return <LanguageSelector label={label} options={options} />;
};

export default FyllUtLanguageSelector;
