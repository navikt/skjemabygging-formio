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
};

export const appStyles = {
  "& .wizard-page": {
    borderRadius: "0.25rem",
    background: "#fff",
    padding: "1rem",
    marginBottom: "1rem",
  },
};
