import navCssVariables from "nav-frontend-core";

export const globalStyles = {
  body: {
    margin: 0,
    backgroundColor: navCssVariables.navGraBakgrunn,
    height: "100%",
    display: "flex",
    flexDirection: "column",
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
  ".margin-bottom-large": {
    marginBottom: "8rem",
  },
  ".margin-left-default": {
    marginLeft: "1rem",
  },
  "main:focus": {
    outline: "none",
  },
};

export const appStyles = {
  "& .wizard-page": {
    borderRadius: "0.25rem",
    background: "#fff",
    padding: "1rem",
    marginBottom: "1rem",
    "& > .formio-component:last-of-type": {
      marginBottom: "4rem",
    },
  },
};
