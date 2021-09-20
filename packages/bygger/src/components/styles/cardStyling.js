const cardStyling = {
  ".card": {
    backgroundColor: "#ffffff",
    border: "1px solid #dee2e6",
    borderRadius: "calc(.25rem - 1px)",

    "&-header": {
      backgroundColor: "rgba(0,0,0,.03)",
      borderBottom: "1px solid #dee2e6",
      borderRadius: "calc(.25rem - 1px) calc(.25rem - 1px) 0 0",
      padding: ".75rem 1.25rem",
    },
    "&-body": {
      flex: "1 1 auto",
      minHeight: "1px",
      padding: "1.25rem",
    },
  },
};

export default cardStyling;
