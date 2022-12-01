const bootstrapFormInputStyles = {
  "& .mb-2": {
    marginBottom: "0.5rem",
  },
  "& [hidden]": {
    display: "none !important",
  },
  "& .form-group.formio-component, .formio-component-htmlelement": {
    marginBottom: "2.5rem",
  },

  "& fieldset": {
    padding: "0",
    margin: "0",
    border: "0",
  },

  "& .formio-select-autocomplete-input": {
    opacity: "0",
    position: "absolute",
    zIndex: "-1",
  },

  "& .form-check-inline": {
    display: "inline-flex",
    alignItems: "center",
    paddingLeft: "0",
    marginRight: ".75rem",
  },
};

export default bootstrapFormInputStyles;
