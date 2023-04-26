const inputGroup = {
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
    fontWeight: 400,
    minHeight: "var(--input-min-height)",
    textAlign: "center",
    whiteSpace: "nowrap",
    border: "1px solid #78706a",
    borderRadius: ".25rem",
  },
};

export default inputGroup;
