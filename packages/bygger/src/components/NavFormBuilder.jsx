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
import "bootstrap/dist/css/bootstrap.min.css";
import { navFormStyle } from "@navikt/skjemadigitalisering-shared-components";

const BuilderMountElement = styled("div")({
  "& .formbuilder": {
    position: "relative",
    "@media screen and (min-width: 40rem)": {
      height: "calc(100vh - 13.5rem)",
      display: "grid",
      gridTemplateColumns: "14rem minmax(20rem, 50rem)",
      gridGap: "2rem",
      alignItems: "start",
      margin: "0 auto",
      maxWidth: "66rem",
      minWidth: "36rem",
      overflow: "hidden",
    },
  },
  "& .formarea": {
    paddingBottom: "2rem",
    overflowY: "auto",
    height: "100%",
  },
  "& .formcomponents": {
    overflowY: "auto",
    height: "100%",
    "& .builder-sidebar_scroll": {
      position: "initial",
    },
  },
  "& .formio-dialog": {
    zIndex: 900,
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
        className={this.props.className}
        data-testid="builderMountElement"
        ref={this.element}
      ></BuilderMountElement>
    );
  };
}

export { NavFormBuilder as UnstyledNavFormBuilder };
export default styled(NavFormBuilder)(navFormStyle);
