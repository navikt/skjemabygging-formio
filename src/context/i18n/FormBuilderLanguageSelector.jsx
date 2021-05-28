import React from "react";
import { languagesInOriginalLanguage, useTranslations } from "./index";
import LanguageSelector from "../../components/LanguageSelector";
import { useLanguages } from "../languages";

const FormBuilderLanguageSelector = ({ formPath, languageSelectorLabel }) => {
  const { currentLanguage, availableLanguages } = useLanguages();
  const { translations } = useTranslations();

  if (availableLanguages.length === 0) {
    return null;
  }

  const options = availableLanguages
    .map((languageCode) => ({
      languageCode,
      optionLabel: `${!translations[languageCode] ? `Legg til ` : ""}${languagesInOriginalLanguage[languageCode]}`,
      href: `/translation/${formPath}/${languageCode}`,
    }))
    .sort((lang1, lang2) =>
      lang1.optionLabel.startsWith("Legg til") ? 1 : lang2.optionLabel.startsWith("Legg til") ? -1 : 0
    );

  const label = languageSelectorLabel ? languageSelectorLabel : languagesInOriginalLanguage[currentLanguage];

  return <LanguageSelector label={label} options={options} />;
};

export default FormBuilderLanguageSelector;
