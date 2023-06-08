import buttonRow from "./buttonRow";
import margin from "./margin";
import stepper from "./stepper";
import vars from "./vars";

const global = {
  html: {
    height: "100%",
    fontFamily: "Source Sans Pro, Arial, sans-serif",
  },
  body: {
    margin: 0,
    backgroundColor: "#ffffff",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    lineHeight: "1.5",
    fontSize: "1.125rem",
    fontWeight: 400,
    fontFamily: "Source Sans Pro, Arial, sans-serif",
    textAlign: "left",
    color: "#262626",
  },
  a: {
    color: "#0067c5",
  },
  fieldset: {
    border: 0,
    padding: 0,
  },
  ".pagewrapper": {
    flex: "1 0 auto",
  },
  "#decorator-footer": {
    flexShrink: 0,
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
  ...buttonRow,
  ...margin,
  ...stepper,
  ...vars,
};

export default global;
