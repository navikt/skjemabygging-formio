const formAreaStyles = {
  ".formarea": {
    paddingBottom: "20rem",
    overflowY: "auto",
    height: "100%",

    // Start form panel list
    "& .breadcrumb": {
      display: "flex",
      flexWrap: "wrap",
      padding: "0.75rem 1rem",
      margin: "0 0 1rem",
      listStyle: "none",
      backgroundColor: "#e9ecef",
      borderRadius: "0.25rem",

      "& .wizard-page-label": {
        alignItems: "center",
        backgroundColor: "#17a2b8",
        border: "none",
        borderRadius: "0.25rem",
        color: "white",
        cursor: "pointer",
        display: "flex",
        padding: "0.3rem 0.5rem",
        fontSize: "1rem",
        fontWeight: "700",
        lineHeight: "1",
        marginBottom: "0.5rem",
        textAlign: "center",
        textDecoration: "none",
        verticalAlign: "baseline",
        whiteSpace: "nowrap",

        "&:focus": {
          border: "0.1rem solid #17a2b8",
          backgroundColor: "white",
          color: "#17a2b8",
          outline: "none",
          padding: "0.2rem 0.4rem",
        },

        "&[aria-current]": {
          backgroundColor: "#007bff",

          "&:focus": {
            border: "0.1rem solid #007bff",
            backgroundColor: "white",
            color: "#007bff",
          },
        },
        "&__add-new": {
          backgroundColor: "#28a745",

          "&:focus": {
            border: "0.1rem solid #28a745",
            backgroundColor: "white",
            color: "#28a745",
          },
        },
      },
      "& li:not(:last-child) .wizard-page-label": {
        marginRight: "0.5rem",
      },
    },
    // End form panel list

    //Start builder-component
    "& .builder-component": {
      position: "relative",

      "&:not(:hover) .component-btn-group": {
        display: "none",
      },
      "& .component-btn-group": {
        display: "flex",
        flexDirection: "row",
        position: "absolute",
        top: "0.5rem",
        right: "0",
        zIndex: "1001",

        "& .component-settings-button": {
          "&:not(:last-child)": {
            marginRight: "0.5rem",
          },
        },

        "& svg": {
          fontSize: "1rem",
          verticalAlign: "initial",
        },
      },
    },
    // End builder-component

    // Start drag-container
    "& .drag-container": {
      padding: "10px",
      border: "2px dotted #e8e8e8",

      "&:hover": {
        cursor: "move",
        border: "2px dotted #ccc",
      },

      "&.formio-builder-form": {
        "&, &:hover": {
          padding: "0 0 1rem",
          border: "none",
        },
      },
    },
    // End drag-container
  },
};

export default formAreaStyles;
