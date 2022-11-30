import merge from "lodash.merge";

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
  "& .skjemagruppe__content, & .data-grid__row ": {
    borderLeft: "4px solid #368da8",
    backgroundColor: "#e6f1f8",
    padding: "0.75rem 1rem",
    margin: "0.375rem 0",
    "& .data-grid__row": {
      backgroundColor: "#cce2f0",
    },
    "& .skjemagruppe__content": {
      borderLeft: "0",
      paddingLeft: "0",
      backgroundColor: "transparent",
    },
  },
  "& .skjemagruppe__content": {
    "& .formio-component:not(.formio-hidden):last-of-type": {
      marginBottom: "0.75rem",
    },
  },
  "& .data-grid__row": {
    marginBottom: "1rem",
    "& div:last-of-type .formio-component:not(.formio-hidden):last-of-type": {
      marginBottom: "0.75rem",
    },
    "& .knapp--fjern": {
      justifyContent: "start",
      minWidth: "initial",
    },
  },
  "& .datagrid-add-remove-row": {
    display: "flex",
    flexDirection: "row",
    gap: "1rem",
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
  fieldsSideBySideStyles,
  allFieldsStyles,
  errorValidationStyles,
  componentCollectionStyles,
  errorValidationStyles
);
export default navFormStyle;
