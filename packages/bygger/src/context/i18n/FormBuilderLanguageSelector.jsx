import React from "react";
import { LanguageSelector, useLanguages } from "@navikt/skjemadigitalisering-shared-components";
import { useTranslations } from "./index";

const languagesInOriginalLanguage = {
  "nb-NO": "Norsk bokmål",
  "nn-NO": "Norsk nynorsk",
  en: "English",
  pl: "Polskie",
};

const FormBuilderLanguageSelector = ({ formPath, languageSelectorLabel, tag }) => {
  const { currentLanguage, availableLanguages } = useLanguages();
  const { translations } = useTranslations();

  if (availableLanguages.length === 0) {
    return null;
  }

  const options = availableLanguages
    .map((languageCode) => ({
      languageCode,
      optionLabel: `${!translations[languageCode] ? `Legg til ` : ""}${languagesInOriginalLanguage[languageCode]}`,
      href: `/translations/${formPath}/${languageCode}${tag ? `/${tag}` : ""}`,
    }))
    .sort((lang1, lang2) =>
      lang1.optionLabel.startsWith("Legg til") ? 1 : lang2.optionLabel.startsWith("Legg til") ? -1 : 0
    );

  const label = languageSelectorLabel ? languageSelectorLabel : languagesInOriginalLanguage[currentLanguage];

  return <LanguageSelector label={label} options={options} />;
};

export default FormBuilderLanguageSelector;
