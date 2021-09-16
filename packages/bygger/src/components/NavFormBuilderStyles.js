const bootstrapFormInputs = {
  "& .form-group.formio-component": {
    marginBottom: "1rem",
  },

  "& fieldset": {
    padding: "0",
    margin: "0",
    border: "0",
  },
  "& .choices": {
    "&.form-group:not(.formio-hidden)": {
      marginBottom: "0",
    },

    "&__list": {
      margin: "0",
      paddingLeft: "0",
      listStyle: "none",

      "&--dropdown": {
        position: "absolute",
        width: "100%",
        backgroundColor: "#fff",
        border: "1px solid #ddd",
        top: "100%",
        marginTop: "-1px",
        borderBottomLeftRadius: "2.5px",
        borderBottomRightRadius: "2.5px",
        overflow: "hidden",
        wordBreak: "break-all",
        willChange: "visibility",
        visibility: "hidden",
        zIndex: "100",

        "&.is-active": {
          position: "relative",
          visibility: "visible",
        },

        "& .choices__list": {
          position: "relative",
          maxHeight: "300px",
          overflow: "auto",
          willChange: "scroll-position",
        },

        "& .choices__item": {
          position: "relative",
          padding: "10px",
          fontSize: "14px",

          "&--selectable": {
            whiteWrap: "nowrap",
            overflow: "hidden",
            paddingRight: "25px",
            textOverflow: "ellipsis",

            "&.is-highlighted": {
              backgroundColor: "#f2f2f2",
            },
          },
        },
      },
    },
    "&__input": {
      display: "block",
      width: "100%",
      padding: "10px",
      borderBottom: "1px solid #ddd",
      backgroundColor: "#fff",
      margin: "0",
      verticalAlign: "baseline",
      fontSize: "14px",
      border: "0",
      borderRadius: "0",
      maxWidth: "100%",

      "&[hidden]": {
        display: "none",
      },
    },
    "&__button": {
      padding: "0",
      backgroundColor: "transparent",
      backgroundImage:
        "url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjEiIGhlaWdodD0iMjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMi41OTIuMDQ0bDE4LjM2NCAxOC4zNjQtMi41NDggMi41NDhMLjA0NCAyLjU5MnoiLz48cGF0aCBkPSJNMCAxOC4zNjRMMTguMzY0IDBsMi41NDggMi41NDhMMi41NDggMjAuOTEyeiIvPjwvZz48L3N2Zz4=)",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "50%",
      backgroundSize: "8px",
      border: "0",
      position: "absolute",
      top: "50%",
      right: "0",
      marginTop: "-10px",
      marginRight: "25px",
      height: "20px",
      width: "20px",
      borderRadius: "10em",
      opacity: ".5",
      textIndent: "-9999px",
    },
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

export { bootstrapFormInputs };
