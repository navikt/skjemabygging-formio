import React from "react";
import {
  LanguageSelector,
  i18nData,
  useCurrentLanguage,
  useLanguageCodeFromURL,
} from "@navikt/skjemadigitalisering-shared-components";
import { languagesInNorwegian, useTranslations } from "./index";

const FormBuilderLanguageSelector = ({ formPath, languageSelectorLabel, tag }) => {
  const { currentLanguage } = useCurrentLanguage(useLanguageCodeFromURL(), i18nData);
  const supportedLanguageLists = Object.keys(i18nData).filter((languageCode) => languageCode !== "nb-NO");
  const { availableLanguages } = useTranslations();

  const options = supportedLanguageLists
    .map((languageCode) => ({
      languageCode,
      optionLabel: `${availableLanguages.indexOf(languageCode) < 0 ? `Legg til ` : ""}${
        languagesInNorwegian[languageCode]
      }`,
      href: `/translations/${formPath}/${languageCode}${tag ? `/${tag}` : ""}`,
    }))
    .sort((lang1, lang2) =>
      lang1.optionLabel.startsWith("Legg til") ? 1 : lang2.optionLabel.startsWith("Legg til") ? -1 : 0
    );

  const label = languageSelectorLabel
    ? languageSelectorLabel
    : languagesInNorwegian[currentLanguage]
    ? languagesInNorwegian[currentLanguage]
    : "Velg språk";

  return <LanguageSelector label={label} options={options} />;
};

export default FormBuilderLanguageSelector;
