/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Form.io
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * */

import React, { Component } from "react";
import PropTypes from "prop-types";
import * as formiojs from "formiojs";
import isEqual from "lodash.isequal";
import cloneDeep from "lodash.clonedeep";
import { makeStyles } from "@material-ui/styles";
import { bootstrapStyles, navFormStyle } from "@navikt/skjemadigitalisering-shared-components";
import { bootstrapFormInputs, formioTable } from "./NavFormBuilderStyles";

const useBuilderMountElementStyles = makeStyles({
  "@global": {
    ".formio-form": {
      ...navFormStyle,
      ...bootstrapFormInputs,
      ...formioTable,
    },
    // Start form builder
    ".formbuilder": {
      position: "relative",

      "@media screen and (min-width: 40rem)": {
        height: "calc(100vh - 16.5rem)",
        display: "grid",
        gridTemplateColumns: "12.875rem minmax(20rem, 50rem)",
        gridGap: "1.5rem",
        alignItems: "start",
        margin: "0 auto",
        maxWidth: "66rem",
        minWidth: "36rem",
        overflow: "hidden",
      },
    },
    // End form builder
    // Start form component list
    ".formcomponents": {
      overflowY: "auto",
      height: "100%",
      "& .builder-sidebar_scroll": {
        position: "initial",
        paddingBottom: "10rem",
      },
      "& .card-body": {
        padding: "0.2rem",
      },
      "& .form-builder-panel": {
        backgroundColor: "#ffffff",
        borderRadius: "calc(.25rem - 1px)",

        "& .form-builder-group-header": {
          margin: "0",
          padding: "0",
        },

        "& .builder-group-button": {
          display: "block",
          width: "100%",
          backgroundColor: "rgba(0,0,0,.03)",
          border: "0",
          padding: ".375rem .75rem",
          fontSize: "1rem",
          lineHeight: "1.5",

          "&:not(:first-child)": {
            marginTop: "0.2rem",
          },
        },
        "&:first-child .builder-group-button": {
          borderRadius: "calc(.25rem - 1px) calc(.25rem - 1px) 0 0",
        },
        "&:last-child .builder-group-button": {
          borderRadius: "0 0 calc(.25rem - 1px) calc(.25rem - 1px)",
        },
      },
      "& .formcomponent": {
        backgroundColor: "#007bff",
        borderColor: "#007bff",
        borderRadius: ".3em",
        color: "#fff",
        display: "block",
        fontSize: ".8em",
        lineHeight: "1.2",
        margin: ".2rem",
        padding: "5px 5px 5px 8px",
        textAlign: "left",
        width: "block",
      },
    },
    // End form component list
    // Start edit form area
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
    // End edit form area
    // Start card styling
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
    // End card styling
    // Start formio-dialog
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

        "&-sm-6": {
          flex: "0 0 50%",
          maxWidth: "50%",
        },

        "&-sm-12": {
          flex: "0 0 100%",
          maxWidth: "100%",
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

      ...bootstrapStyles,
    },
    // End formio-dialog

    // Start miscellaneous styling
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
    // End miscellaneous styling
  },
});

const BuilderMountElement = ({ children, className, setRef, ...rest }) => {
  useBuilderMountElementStyles();
  return (
    <div className={className} ref={setRef} {...rest}>
      {children}
    </div>
  );
};

class NavFormBuilder extends Component {
  builderState = "preparing";
  element = React.createRef();
  static propTypes = {
    form: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    formBuilderOptions: PropTypes.object,
  };

  handleChange = () => {
    if (this.builder) {
      this.props.onChange(cloneDeep(this.builder.instance.form));
    }
  };

  createBuilder = () => {
    this.builder = new formiojs.FormBuilder(
      this.element.current,
      cloneDeep(this.props.form),
      this.props.formBuilderOptions
    );
    this.builderReady = this.builder.ready;
    this.builderReady.then(() => {
      this.builderState = "ready";
      this.handleChange();
      this.builder.instance.on("addComponent", this.handleChange);
      this.builder.instance.on("saveComponent", this.handleChange);
      this.builder.instance.on("updateComponent", this.handleChange);
      this.builder.instance.on("removeComponent", this.handleChange);
      this.builder.instance.on("deleteComponent", this.handleChange);
      this.builder.instance.on("pdfUploaded", this.handleChange);
    });
  };

  destroyBuilder = () => {
    this.builder.destroy();
    this.builder.instance.destroy(true);
    this.builder = null;
    this.builderState = "destroyed";
    console.log("destroyed builder");
  };

  updateFormBuilder() {
    this.destroyBuilder();
    this.createBuilder();
  }

  componentDidMount = () => {
    this.createBuilder();
  };

  componentDidUpdate = () => {
    if (isEqual(this.builder.instance.form, this.props.form)) {
      return;
    }
    this.updateFormBuilder();
  };

  componentWillUnmount = () => {
    this.destroyBuilder();
  };

  render = () => {
    return (
      <BuilderMountElement
        className={`${this.props.className} bootstrap-style`}
        data-testid="builderMountElement"
        setRef={this.element}
      ></BuilderMountElement>
    );
  };
}

export { NavFormBuilder as UnstyledNavFormBuilder };
export default NavFormBuilder;
