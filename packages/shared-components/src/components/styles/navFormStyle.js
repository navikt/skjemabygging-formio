import merge from "lodash.merge";

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
    marginBottom: "2.5rem",
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

const componentCollectionStyles = {
  "& .formio-component-navSkjemagruppe fieldset.skjemagruppe:not(fieldset.skjemagruppe fieldset.skjemagruppe) > div:first-of-type, & .data-grid__row ":
    {
      borderLeft: "4px solid #368DA8",
      backgroundColor: "#E6F1F8",
      padding: "0.75rem 1rem",
      margin: "0.375rem 0",
    },
  "& .formio-component-navSkjemagruppe fieldset.skjemagruppe:not(fieldset.skjemagruppe fieldset.skjemagruppe) > div:first-of-type":
    {
      "& .formio-component:not(.formio-hidden):last-of-type": {
        marginBottom: "0.75rem",
      },
    },
  "& .data-grid__row": {
    marginBottom: "1rem",
    "& div:last-of-type .formio-component:not(.formio-hidden):last-of-type, .knapp--fjern": {
      marginBottom: "0.75rem",
    },
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
  errorValidationStyles,
  stepIndicator,
  componentCollectionStyles,
  errorValidationStyles
);
export default navFormStyle;
