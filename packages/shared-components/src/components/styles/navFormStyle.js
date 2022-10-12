import merge from "lodash.merge";

const wizardSidevelgerStyles = {
  "& .pagination": {
    display: "flex",
    justifyContent: "center",
    padding: "3rem 0 1rem 0",
  },

  "& .stegindikator": {
    margin: "3rem",
  },

  "& .stegindikator__steg-inner--aktiv .stegindikator__steg-num": {
    minWidth: "2rem",
    width: "auto",
    padding: "0 0.5rem",
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

const componentCollectionStyles = {
  "& fieldset.skjemagruppe:not(.data-grid__row):not(fieldset.skjemagruppe fieldset.skjemagruppe) > div:first-of-type, & .data-grid__row ":
    {
      borderLeft: "4px solid #368DA8",
      backgroundColor: "#E6F1F8",
      padding: "0.75rem 1rem",
      margin: "0.25rem 0",
    },
  "& .data-grid__row": {
    marginBottom: "1rem",
    "& .knapp--fjern": {
      marginBottom: "1.5rem",
    },
    " & > .skjemagruppe__legend": {
      float: "left",
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

const navFormStyle = merge(
  styles,
  wizardSidevelgerStyles,
  fieldsSideBySideStyles,
  allFieldsStyles,
  componentCollectionStyles,
  errorValidationStyles
);
export default navFormStyle;
