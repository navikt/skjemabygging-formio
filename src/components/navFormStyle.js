const wizardSidevelgerStyles = {
  "& .pagination": {
    display: "flex",
    justifyContent: "center",
    padding: "3rem 0 1rem 0",
  },

  "& .stegindikator__wrapper": {
    margin: "3rem",
  },
};

const skjemaelementStyles = {
  "& .skjemaelement__label.field-required::after": {
    content: '""',
  },
  "& .skjemaelement__label:not(.field-required)::after": {
    content: '" (valgfritt)"',
  },
  "& .checkboks[required] + .skjemaelement__label::after": {
    content: '""',
  },
  "& .skjemaelement__rad": {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(8rem, 1fr))",
    gap: "1rem",
  },
};

const styles = {
  "& .input-group": {
    "&>.custom-file, &>.custom-select, &>.form-control, &>.form-control-plaintext": {
      flex: "initial",
    },
  },
  "& .data-grid__row": {
    border: "2px solid white",
    borderRadius: "7px",
    marginBottom: "1rem",
    padding: "1.5rem 2rem 0",

    "& .knapp--fjern": {
      marginBottom: "1.5rem",
    },
  },
  "& .formio-error-wrapper, & .formio-warning-wrapper": {
    padding: "0",
  },
  "& .data-grid__row > .skjemagruppe__legend": {
    float: "left",
  },
  "& .wizard-page": {
    borderRadius: "0.25rem",
    background: "#fff",
    padding: "1rem",
    margin: "1rem 0 1rem 0",
  },

  //Alle skjemafelter -- start
  "& .form-group": {
    marginBottom: "2rem",
  },
  //Alle skjemafelter -- slutt
};

export default {
  ...styles,
  ...wizardSidevelgerStyles,
  ...skjemaelementStyles,
};
