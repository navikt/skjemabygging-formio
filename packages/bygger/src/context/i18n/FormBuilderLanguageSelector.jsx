import { makeStyles } from "@material-ui/styles";
import {
  i18nData,
  LanguageSelector,
  useCurrentLanguage,
  useLanguageCodeFromURL,
} from "@navikt/skjemadigitalisering-shared-components";
import React, { useMemo } from "react";
import { getAvailableLanguages, languagesInNorwegian, useI18nState } from "./index";

const useStyles = makeStyles({
  sideBarLanguageSelector: {
    margin: "0 auto 4rem",
  },
});

const FormBuilderLanguageSelector = ({ formPath, languageSelectorLabel, tag }) => {
  const { currentLanguage } = useCurrentLanguage(useLanguageCodeFromURL(), i18nData);
  const supportedLanguageLists = Object.keys(i18nData).filter((languageCode) => languageCode !== "nb-NO");

  const { translations } = useI18nState();
  const availableLanguages = useMemo(() => getAvailableLanguages(translations), [translations]);
  const styles = useStyles();

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

  const getLanguageSelectorLabel = () => {
    if (languageSelectorLabel) {
      return languageSelectorLabel;
    } else if (languagesInNorwegian[currentLanguage]) {
      return languagesInNorwegian[currentLanguage];
    } else {
      return "Velg språk";
    }
  };

  return (
    <LanguageSelector className={styles.sideBarLanguageSelector} label={getLanguageSelectorLabel()} options={options} />
  );
};

export default FormBuilderLanguageSelector;
