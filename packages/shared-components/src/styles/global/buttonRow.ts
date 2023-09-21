const buttonRow = {
  ".button-row": {
    display: "flex",
    flexDirection: "row-reverse",
    justifyContent: "flex-end",
    gap: "var(--a-spacing-5)",
    flexWrap: "wrap",
    marginBottom: "var(--a-spacing-5)",
    "& button, & a": {
      flexGrow: 1,
      minWidth: "12rem",
      maxWidth: "18.75rem",
    },
    "&__center": {
      justifyContent: "center",
      "@media (max-width: var(--a-breakpoint-md-down))": {
        justifyContent: "flex-end",
      },
    },
  },
  ".navigation-detail": {
    display: "flex",
    justifyContent: "center",
  },
  ".modal-close": {
    position: "absolute",
    right: "1rem",
    top: "1rem",
    width: "initial",
    minWidth: "initial",
  },
  ".cancel-warning-overlay": {
    display: "none",
  },
  ".wizard-nav-modal": {
    maxWidth: "34rem",

    ".modal-heading": {
      marginTop: 0,
      fontSize: "1.5rem",
    },
  },
};

export default buttonRow;
