const miscellaneousFormBuilderStyling = {
  // TODO: Is this used anywhere?
  ".panel-body, .tab-pane": {
    "& >.drag-container.formio-builder-components": {
      "&, &:hover": {
        padding: "0 0 1rem",
        border: "none",
      },
    },
  },
  ".input--s": {
    width: "140px",
  },
  ".input--xs": {
    width: "70px",
  },
  a: {
    color: "#0067c5",
  },
  ".btn": {
    textAlign: "left",
  },
  ".knapp": {
    "&.knapp--hoved, &.knapp--fare": {
      transform: "none",

      "&:hover": {
        transform: "none",
      },
    },
  },
};

export default miscellaneousFormBuilderStyling;
