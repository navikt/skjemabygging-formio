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
  "& .formio-component-navSkjemagruppe fieldset.skjemagruppe:not(fieldset.skjemagruppe fieldset.skjemagruppe) > div:first-of-type, & .data-grid__row ":
    {
      borderLeft: "4px solid #368DA8",
      backgroundColor: "#E6F1F8",
      padding: "0.75rem 1rem",
      margin: "0.375rem 0",
    },
  "& .formio-component-navSkjemagruppe fieldset.skjemagruppe:not(fieldset.skjemagruppe fieldset.skjemagruppe) > div:first-of-type":
    {
      "& .formio-component:last-of-type": {
        marginBottom: "0.75rem",
      },
    },
  "& .data-grid__row": {
    marginBottom: "1rem",
    "& div:last-of-type .formio-component:last-of-type, .knapp--fjern": {
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

const navFormStyle = merge(
  styles,
  wizardSidevelgerStyles,
  fieldsSideBySideStyles,
  allFieldsStyles,
  componentCollectionStyles,
  errorValidationStyles
);
export default navFormStyle;
