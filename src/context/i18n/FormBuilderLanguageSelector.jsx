import React, { useEffect } from "react";
import { languagesInOriginalLanguage, useTranslations } from "./index";
import LanguageSelector from "../../components/LanguageSelector";
import { useLanguages } from "../languages";

const FormBuilderLanguageSelector = ({ formPath }) => {
  const { currentLanguage, availableLanguages } = useLanguages();
  const { updateCurrentTranslation, translations } = useTranslations();

  useEffect(() => {
    updateCurrentTranslation(currentLanguage);
  }, [currentLanguage, updateCurrentTranslation]);

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

  const label = languagesInOriginalLanguage[currentLanguage]
    ? languagesInOriginalLanguage[currentLanguage]
    : "Språk/Language";

  return <LanguageSelector label={label} options={options} />;
};

export default FormBuilderLanguageSelector;
