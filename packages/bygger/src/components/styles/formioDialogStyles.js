const formioDialogStyles = {
  ".formio-dialog": {
    position: "fixed",
    overflow: "auto",
    zIndex: "10000",
    top: "0",
    right: "0",
    bottom: "0",
    left: "0",
    background: "rgba(0,0,0,.4)",
    animation: "formio-dialog-fadein .5s",
    boxSizing: "border-box",
    fontSize: ".8em",
    color: "#666",
    paddingTop: "20px",
    paddingBottom: "20px",

    "&-overlay": {
      position: "fixed",
      top: "0",
      right: "0",
      bottom: "0",
      left: "0",
      marginRight: "15px",
      background: "0 0",
    },

    "&-content": {
      background: "#f0f0f0",
      borderRadius: "5px",
      fontFamily: "Helvetica,sans-serif",
      fontSize: "1.1em",
      lineHeight: "1.5em",
      margin: "0 auto",
      maxWidth: "100%",
      padding: "1em",
      position: "relative",
      width: "80%",
    },

    "& .float-right": {
      float: "right",
    },

    "& .row": {
      display: "flex",
      flexWrap: "wrap",
      margin: "0 -15px",
    },

    "& .col": {
      flexBasis: "0",
      flexGrow: "1",
      maxWidth: "100%",
      position: "relative",
      width: "100%",
      padding: "0 15px",

      "&-sm-2": {
        flex: "0 0 16.6666666667%",
        maxWidth: "16.6666666667%",
        padding: "0 15px",
      },

      "&-sm-6": {
        flex: "0 0 50%",
        maxWidth: "50%",
        padding: "0 15px",
      },

      "&-sm-12": {
        flex: "0 0 100%",
        maxWidth: "100%",
        padding: "0 15px",
      },
    },

    "& .nav-frontend-tabs": {
      "&__tab-inner.active": {
        color: "#262626",
        background: "white",
        border: "1px solid #c9c9c9",
        borderBottom: "1px solid white",
        position: "relative",
        top: "1px",
      },

      "& ~ .panel": {
        borderTop: "0",
        borderTopLeftRadius: "0",
        borderTopRightRadius: "0",
      },
    },

    "& .card-title": {
      margin: "0",
    },

    "& h4": {
      fontSize: "1.4rem",
      fontWeight: "500",
      lineHeight: "1.2",
    },

    "& .lead": {
      fontSize: "1.25rem",
      fontWeight: "300",
      margin: "0 0 1rem",
    },
  },
};

export default formioDialogStyles;
