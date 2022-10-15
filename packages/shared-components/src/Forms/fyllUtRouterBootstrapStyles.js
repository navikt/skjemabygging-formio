export const bootstrapStyles = {
  "& p": {
    marginTop: "0",
    marginBottom: "1rem",
  },
  "& fieldset": {
    border: 0,
  },
  "& dl": {
    marginTop: 0,
    "& > dt": {
      fontWeight: 700,
    },
    "& > dd": {
      marginBottom: ".5rem",
      marginLeft: 0,
    },
  },
  "& ol, & ul": {
    marginTop: 0,
  },
  //Bootstrap prefix og suffix  -- start
  "& .input-group": {
    position: "relative",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "stretch",
    width: "100%",

    "& .form-control": {
      position: "relative",
      minWidth: 0,
      marginBottom: 0,
    },

    "& .form-control:not(:last-child)": {
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
    },

    "& .input-group-append > .input-group-text": {
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
    },

    "& .input-group-prepend > .input-group-text": {
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
    },
  },

  "& .input-group-append, & .input-group-prepend": {
    display: "flex",
  },

  "& .input-group-text": {
    height: "calc(1.5em + .75rem + 2px)",
    display: "flex",
    alignItems: "center",
    padding: "0.5rem",
    marginBottom: 0,
    fontSize: " 1rem",
    fontWeight: 400,
    lineHeight: 1.5,
    textAlign: "center",
    whiteSpace: "nowrap",
    border: "1px solid #78706a",
    borderRadius: ".25rem",
  },
  //Bootstrap prefix og suffix  -- slutt

  //Bootstrap day component
  "& .has-feedback .form-control": {
    height: "calc(1.5em + .75rem + 2px)",
    padding: "0.5rem",
    fontSize: "1rem",
    fontWeight: "400",
    lineHeight: "1.5",
    border: "1px solid #78706a",
    borderRadius: ".25rem",
  },
  " & .formio-select-autocomplete-input": {
    opacity: 0,
    zIndex: -1,
    position: "absolute",
  },
};
