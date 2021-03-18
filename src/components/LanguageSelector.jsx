import React from "react";
import { makeStyles } from "@material-ui/styles";
import navCssVariabler from "nav-frontend-core";
import Select from "./Select";

const useLanguageSelectorStyling = makeStyles({
  languageToggle: {
    display: "flex",
    justifyContent: "center",
    padding: "0.5rem",
    marginBottom: "2rem",
  },
  languageToggleWrapper: {
    minWidth: "230px",
    position: "relative",
    outline: "none",
  },
  languageSelect: {
    "& .select-button": {
      width: "100%",
      display: "grid",
      border: "1px solid #826ba1",
      borderRadius: "0.25rem",
      alignItems: "center",
      gridTemplateColumns: "auto 1rem",
      padding: "0.5rem 2rem 0.5rem 1rem",
      "&:focus": {
        outline: "none",
        boxShadow: "0 0 0 3px #254b6d",
        borderColor: "transparent",
      },
      "& .select__chevron": {
        float: "right",
      },
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
    },
    "& .select-list__option__link": {
      display: "block",
      padding: "0.5rem 1rem",
      "&:hover, &:focus": {
        backgroundColor: navCssVariabler.navBla,
        color: "white",
        width: "100%",
        height: "100%",
      },
    },
  },
});

const LanguageSelector = ({ translations = [] }) => {
  const classes = useLanguageSelectorStyling();
  console.log("LanguageSelector", translations);
  if (translations.length === 0) {
    return null;
  }
  return (
    <div className={classes.languageToggle}>
      <div className={classes.languageToggleWrapper}>
        <Select className={classes.languageSelect} label="Språk/Language" options={translations} />
      </div>
    </div>
  );
};

export default LanguageSelector;
