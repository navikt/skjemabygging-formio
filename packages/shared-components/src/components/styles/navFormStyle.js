import merge from "lodash.merge";
import { navCssVariables } from "../../util/navCssVariables";

const layout = {
  "& .fyllut-layout": {
    "@media screen and (min-width: 40rem)": {
      display: "grid",
      gap: "3rem",
      gridTemplateColumns: "minmax(20rem, 2fr) minmax(15rem, 1fr)",
      margin: "0 auto",
    },
  },
};

const allFieldsStyles = {
  "& .form-group:not(.formio-hidden)": {
    clear: "both",
    marginBottom: "2rem",
  },
};

/* CSS grid for arranging fields side by side. Used by Day component */
const fieldsSideBySideStyles = {
  "& .skjemaelement__rad": {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(8rem, 1fr))",
    gap: "1rem",
  },
};

const dataGridStyles = {
  "& .data-grid__row": {
    border: `1px solid ${navCssVariables.navGra60}`,
    borderRadius: "7px",
    marginBottom: "1rem",
    padding: "1.5rem 2rem 0",

    "& .knapp--fjern": {
      marginBottom: "1.5rem",
    },
  },
  "& .data-grid__row > .skjemagruppe__legend": {
    float: "left",
  },
};

const errorValidationStyles = {
  "& .formio-error-wrapper, & .formio-warning-wrapper": {
    padding: "0",
  },
};

const styles = {
  "& .input-group": {
    "&>.custom-file, &>.custom-select, &>.form-control, &>.form-control-plaintext": {
      flex: "initial",
    },
  },
  "& .formio-component-navCheckbox .skjemagruppe__checkbox-description--below": {
    marginTop: "1rem",
  },
  "& .inputPanel__label": {
    display: "inline-block",
  },

  "& textarea": {
    minHeight: "5.5em",
  },
  "& .img-description": {
    margin: "1rem 0",
  },
  "& .img-component": {
    maxWidth: "100%",
  },
  "& .components-row .builder-components, .components-row": {
    width: "100%",
    display: "flex",
    flexWrap: "wrap",
    columnGap: "24px",
  },
  "& .components-row > div ": {
    maxWidth: "100%",
  },
  "& .components-row .builder-component": {
    flexGrow: "1",
  },
  "& .components-row .formio-component-valutavelger ": {
    minWidth: "224px",
  },
  "& .formio-component-valutavelger .formio-form .choices__list--dropdown .choices__input, .choices__list--single .choices__item":
    {
      maxWidth: "90%",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
};

const stepIndicator = {
  "& .stepper": {
    display: "none",

    "@media screen and (min-width: 40rem)": {
      position: "initial",
      display: "block",
    },

    "& .navds-stepper__content": {
      maxWidth: "26ch",
      wordBreak: "break-word",
      hyphens: "auto",
    },
  },
  "& .stepper--open": {
    display: "block",
    position: "fixed",
    right: 0,
    top: 0,
    zIndex: "100",
    width: "calc(100vw - 1rem)",
    maxWidth: "20rem",
    height: "100%",
    backgroundColor: "white",

    "& .stepper-container": {
      position: "relative",
      padding: "6rem 1.5rem 1.5rem",
      height: "100%",
      overflowY: "auto",
    },
  },
  "& .stepper-close": {
    position: "absolute",
    right: "1rem",
    top: "1rem",

    "@media screen and (min-width: 40rem)": {
      display: "none",
    },
  },
  "& .stepper-toggle": {
    display: "block",
    position: "fixed",
    top: "9rem",
    right: 0,

    "@media screen and (min-width: 40rem)": {
      display: "none",
    },
  },

  "& .stepper-backdrop": {
    display: "none",
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
};

const navFormStyle = merge(
  layout,
  styles,
  fieldsSideBySideStyles,
  allFieldsStyles,
  dataGridStyles,
  errorValidationStyles,
  stepIndicator
);
export default navFormStyle;
