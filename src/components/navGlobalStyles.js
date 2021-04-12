import navCssVariables from "nav-frontend-core";

export const globalStyles = {
  body: {
    margin: 0,
    backgroundColor: navCssVariables.navGraBakgrunn,
    height: "100%",
    display: "flex",
    flexDirection: "column",
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
  ".margin-top-large": {
    marginTop: "4rem",
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
};

export const appStyles = {
  "& .wizard-page": {
    borderRadius: "0.25rem",
    background: "#fff",
    padding: "1rem",
    marginBottom: "1rem",
    maxWidth: "500px",
  },
};
