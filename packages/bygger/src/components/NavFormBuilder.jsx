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
import { builderStyles } from "./styles";
require("../formio-overrides/webform-builder-overrides");

const useBuilderMountElementStyles = makeStyles(builderStyles);

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
    onReady: PropTypes.func,
    formBuilderOptions: PropTypes.object,
  };

  handleChange = () => {
    this.props.onChange(cloneDeep(this.builder.instance.form));
  };

  createBuilder = () => {
    this.builder = new formiojs.FormBuilder(
      this.element.current,
      cloneDeep(this.props.form),
      this.props.formBuilderOptions
    );
    this.builderReady = this.builder.ready;
    this.builderReady.then(() => {
      this.builder.instance.on("change", this.handleChange);
      this.builderState = "ready";
      this.handleChange();
      if (this.props.onReady) {
        this.props.onReady();
      }
    });
  };

  destroyBuilder = () => {
    this.builder.instance.off("change", this.handleChange);
    this.builder.instance.destroy(true);
    this.builder.destroy();
    this.builder = null;
    this.builderState = "destroyed";
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
