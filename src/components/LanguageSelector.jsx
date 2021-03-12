import React from "react";
import { makeStyles } from "@material-ui/styles";
import navCssVariabler from "nav-frontend-core";
import Select from "./Select";

const useLanguageSelectorStyling = makeStyles({
  languageToggle: {
    display: "flex",
    justifyContent: "center",
    padding: "0.5rem",
  },
  languageToggleWrapper: {
    minWidth: "230px",
    position: "relative",
    outline: "none",
  },
  languageSelect: {
    "& .select-button": {
      width: "100%",
      display: "flex",
      border: "1px solid #826ba1",
      borderRadius: "0.25rem",
      alignItems: "center",
      flexWrap: "nowrap",
      padding: "0.5rem 2rem 0.5rem 1rem",
    },
    "& .select-list": {
      margin: "0",
      padding: "0",
      width: "100%",
      backgroundColor: "white",
      boxSizing: "border-box",
      borderRight: "1px solid rgb(198, 194, 191)",
      borderBottom: "1px solid rgb(198, 194, 191)",
      borderLeft: "1px solid rgb(198, 194, 191)",
      borderImage: "initial",
      borderTop: "none",
      boxShadow: "rgba(0, 0, 0, 0.08) 0px 0.05rem 0.25rem 0.125rem",
      borderRadius: "0px 0px 4px 4px",
      outline: "none",
      cursor: "pointer",
      listStyleType: "none",
    },
    "& .select-list__option": {
      borderBottom: "1px solid rgb(198, 194, 191)",
      padding: "0.5rem 1rem",
    },
    "& .select-list__option:hover": {
      backgroundColor: navCssVariabler.navBla,
      color: "white",
    },
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
          className={classes.languageSelect}
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
