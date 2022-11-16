import stepperStyles from "./stepperStyles.js";

export const globalStyles = {
  body: {
    margin: 0,
    backgroundColor: "#ffffff",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    lineHeight: "1.5",
    fontSize: "1rem",
    fontWeight: 400,
    fontFamily: "Source Sans Pro, Arial, sans-serif",
    textAlign: "left",
    color: "#262626",
  },
  a: {
    color: "#0067c5",
  },
  ".pagewrapper": {
    flex: "1 0 auto",
  },
  "#decorator-footer": {
    flexShrink: 0,
  },
  html: {
    height: "100%",
    fontFamily: "Source Sans Pro, Arial, sans-serif",
  },
  /* Set as global styles to apply inside of formio-dialog (modal), as it is not placed inside of NavFormBuilder */
  ".formio-fieldset": {
    padding: "0",
  },
  ".margin-bottom-default": {
    marginBottom: "1rem",
  },
  ".margin-bottom-small": {
    marginBottom: "0.5rem",
  },
  ".margin-bottom-double": {
    marginBottom: "2rem",
  },
  ".margin-bottom-large": {
    marginBottom: "8rem",
  },
  ".margin-left-default": {
    marginLeft: "1rem",
  },
  "main:focus": {
    outline: "none",
  },
  ".fyllut-layout": {
    "@media screen and (min-width: 40rem)": {
      display: "grid",
      gap: "3rem",
      gridTemplateColumns: "minmax(20rem, 2fr) minmax(15rem, 1fr)",
      margin: "0 auto",
    },
  },
  ".nav-form > .alert.alert-danger": {
    "@media screen and (min-width: 40rem)": {
      maxWidth: "608px",
    },
  },
  ...stepperStyles,
};

export const appStyles = {
  "& .wizard-page": {
    paddingBottom: "3.75rem",
  },
};
