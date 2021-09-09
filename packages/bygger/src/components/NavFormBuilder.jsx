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
import { styled } from "@material-ui/styles";
import { navFormStyle } from "@navikt/skjemadigitalisering-shared-components";

const BuilderMountElement = styled("div")({
  "& .formbuilder": {
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
  "& .formarea": {
    paddingBottom: "20rem",
    overflowY: "auto",
    height: "100%",
  },
  "& .formcomponents": {
    overflowY: "auto",
    height: "100%",
    "& .builder-sidebar_scroll": {
      position: "initial",
      paddingBottom: "10rem",
    },
  },
  "& .formio-dialog": {
    zIndex: 900,
  },
  "& .input--s": {
    width: "140px",
  },
  "& .input--xs": {
    width: "70px",
  },
  "& a": {
    color: "#0067c5",
  },
  "& .btn-block + .btn-block": {
    marginTop: "0.2rem",
  },
  "& .btn": {
    textAlign: "left",
  },
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
  "& .panel-body, & .tab-pane": {
    "& >.drag-container.formio-builder-components": {
      "&, &:hover": {
        padding: "0 0 1rem",
        border: "none",
      },
    },
  },

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
  "& .form-builder-panel": {
    backgroundColor: "#ffffff",
    borderRadius: ".25rem",

    "& .form-builder-group-header": {
      margin: "0",
      padding: "0",
    },

    "& .builder-group-button": {
      display: "block",
      width: "100%",
      backgroundColor: "rgba(0,0,0,.03)",
      border: "1px solid rgba(0,0,0,.125)",
      padding: ".375rem .75rem",
      fontSize: "1rem",
      lineHeight: "1.5",
    },
    "&:first-child .builder-group-button": {
      borderRadius: ".25rem .25rem 0 0",
    },
    "&:last-child .builder-group-button": {
      borderRadius: "0 0 .25rem .25rem",
    },

    "& .cardBody": {
      padding: "0.2rem",
    },
  },
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

      "& .component-settings-button:not(:last-of-type)": {
        marginRight: "0.5rem",
      },

      "& svg": {
        fontSize: "1rem",
        verticalAlign: "initial",
      },
    },
  },
});

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
        ref={this.element}
      ></BuilderMountElement>
    );
  };
}

export { NavFormBuilder as UnstyledNavFormBuilder };
export default styled(NavFormBuilder)(navFormStyle);
