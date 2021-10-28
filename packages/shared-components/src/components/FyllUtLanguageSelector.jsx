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

  if (currentLanguage !== "nb-NO" && availableLanguages.indexOf("nb-NO") < 0) {
    availableLanguages.push("nb-NO");
  }

  const options = availableLanguages
    .filter((languageCode) => languageCode !== currentLanguage)
    .map((languageCode) => ({
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
