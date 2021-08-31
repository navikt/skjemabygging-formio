export const bootstrapStyles = {
  "& p": {
    marginTop: "0",
    marginBottom: "1rem",
  },
  "& fieldset": {
    border: 0,
    "& legend": {
      fontSize: "1.5rem",
      marginBottom: ".5rem",
      lineHeight: "inherit",
    },
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
    zIndex: 10000,

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
    display: "flex",
    alignItems: "center",
    padding: ".375rem .75rem",
    marginBottom: 0,
    fontSize: " 1rem",
    fontWeight: 400,
    lineHeight: 1.5,
    textAlign: "center",
    whiteSpace: "nowrap",
    backgroundColor: " #e9ecef",
    border: "1px solid #ced4da",
    borderRadius: ".25rem",
  },
  //Bootstrap prefix og suffix  -- slutt

  //Bootstrap day component
  "& .has-feedback .form-control": {
    height: "calc(1.5em + .75rem + 2px)",
    padding: ".375rem .75rem",
    fontSize: "1rem",
    fontWeight: "400",
    lineHeight: "1.5",
    border: "1px solid #ced4da",
    borderRadius: ".25rem",
  },
};
