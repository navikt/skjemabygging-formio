import React from "react";
import { makeStyles } from "@material-ui/styles";
import navCssVariabler from "nav-frontend-core";
import Select from "./Select";

const useLanguageSelectorStyling = makeStyles({
  languageToggle: {
    backgroundColor: navCssVariabler.navLysGra,
    display: "flex",
    justifyContent: "center",
    padding: "0.5rem",
  },
  languageToggleWrapper: {
    minWidth: "230px",
    position: "relative",
    outline: "none",
  },
  languageToggleButton: {
    width: "100%",
    display: "flex",
    border: "1px solid #826ba1",
    borderRadius: "0.25rem",
    alignItems: "center",
    flexWrap: "nowrap",
    padding: "0.5rem 2rem 0.5rem 1rem",
  },
});

const languages = {
  en: "English",
  "nb-NO": "Norsk (bokmål)",
  "nn-NO": "Norsk (nynorsk)",
  pl: "Polsk",
};

const LanguageSelector = ({ translations }) => {
  const classes = useLanguageSelectorStyling();

  console.log("LanguageSelector", translations);
  if (!translations) {
    return null;
  }
  return (
    <div className={classes.languageToggle}>
      <div className={classes.languageToggleWrapper}>
        <Select
          className={classes.languageToggleButton}
          label="Språk/Language"
          onChange={(languageCode) => window.setLanguage(languageCode)}
          options={translations.map((languageCode) => ({
            optionLabel: languages[languageCode] || languageCode,
            value: languageCode,
          }))}
        />
      </div>
    </div>
  );
};

export default LanguageSelector;
