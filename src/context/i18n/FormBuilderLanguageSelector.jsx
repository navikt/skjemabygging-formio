import React from "react";
import { languagesInOriginalLanguage, useTranslations } from "./index";
import LanguageSelector from "../../components/LanguageSelector";

const FormBuilderLanguageSelector = ({ createLink, formPath }) => {
  const { currentLanguage, availableLanguages } = useTranslations();
  const options = availableLanguages
    .map((languageCode) => ({
      languageCode,
      optionLabel: `${availableLanguages.indexOf(languageCode) === -1 ? `Legg til ` : ""}${
        languagesInOriginalLanguage[languageCode]
      }`,
      href: createLink(languageCode, formPath),
    }))
    .sort((lang1, lang2) =>
      lang1.optionLabel.startsWith("Legg til") ? 1 : lang2.optionLabel.startsWith("Legg til") ? -1 : 0
    );

  if (options.length === 0) {
    return null;
  }

  const label = languagesInOriginalLanguage[currentLanguage]
    ? languagesInOriginalLanguage[currentLanguage]
    : "Språk/Language";

  return <LanguageSelector label={label} options={options} />;
};

export default FormBuilderLanguageSelector;
