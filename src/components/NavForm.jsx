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
import EventEmitter from "eventemitter2";
import AllComponents from "formiojs/components";
import { Components, Form as FormioForm, Formio } from "formiojs";
import "nav-frontend-skjema-style";
import navdesign from "template";
import i18nData from "../i18nData";

Components.setComponents(AllComponents);
Formio.use(navdesign);

export default class NavForm extends Component {
  static propTypes = {
    src: PropTypes.string,
    url: PropTypes.string,
    form: PropTypes.object,
    submission: PropTypes.object,
    options: PropTypes.shape({
      language: PropTypes.string,
      readOnly: PropTypes.bool,
      noAlerts: PropTypes.bool,
      i18n: PropTypes.object,
      template: PropTypes.string,
      saveDraft: PropTypes.bool,
    }),
    onPrevPage: PropTypes.func,
    onNextPage: PropTypes.func,
    onCancel: PropTypes.func,
    onChange: PropTypes.func,
    onCustomEvent: PropTypes.func,
    onComponentChange: PropTypes.func,
    onSubmit: PropTypes.func,
    onSubmitDone: PropTypes.func,
    onFormLoad: PropTypes.func,
    onError: PropTypes.func,
    onRender: PropTypes.func,
    onAttach: PropTypes.func,
    onBuild: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    onInitialized: PropTypes.func,
    formioform: PropTypes.any,
  };

  static defaultProps = {
    options: {
      language: "nb-NO",
      i18n: i18nData,
    },
    onNextPage: focusAndScrollToNextAndPreviousPage,
    onPrevPage: focusAndScrollToNextAndPreviousPage,
  };

  static getDefaultEmitter() {
    return new EventEmitter({
      wildcard: false,
      maxListeners: 0,
    });
  }

  componentDidMount = () => {
    const { options, src, url, form } = this.props;

    if (!options.events) {
      options.events = NavForm.getDefaultEmitter();
    }

    if (src) {
      this.instance = new (this.props.formioform || FormioForm)(this.element, src, options);
      this.createPromise = this.instance.ready.then((formio) => {
        this.formio = formio;
        this.formio.src = src;
      });
    }
    if (form) {
      this.instance = new (this.props.formioform || FormioForm)(this.element, form, options);
      this.createPromise = this.instance.ready.then((formio) => {
        this.formio = formio;
        this.formio.form = form;
        if (url) {
          this.formio.url = url;
        }

        return this.formio;
      });
    }

    this.initializeFormio();
  };

  componentWillUnmount = () => {
    if (this.formio !== undefined) {
      this.formio.destroy(true);
    }
  };

  initializeFormio = () => {
    if (this.createPromise) {
      this.instance.onAny((event, ...args) => {
        if (event.startsWith("formio.")) {
          const funcName = `on${event.charAt(7).toUpperCase()}${event.slice(8)}`;
          if (this.props.hasOwnProperty(funcName) && typeof this.props[funcName] === "function") {
            this.props[funcName](...args);
          }
        }
      });
      this.createPromise.then(() => {
        if (this.props.submission) {
          this.formio.submission = this.props.submission;
        }
      });
    }
  };

  UNSAFE_componentWillReceiveProps = (nextProps) => {
    const { options = {}, src, form, submission } = this.props;

    if (!options.events) {
      options.events = NavForm.getDefaultEmitter();
    }

    if (src !== nextProps.src) {
      this.instance = new (this.props.formioform || FormioForm)(this.element, nextProps.src, options);
      this.createPromise = this.instance.ready.then((formio) => {
        this.formio = formio;
        this.formio.src = nextProps.src;
      });
      this.initializeFormio();
    }
    if (form !== nextProps.form) {
      this.instance = new (this.props.formioform || FormioForm)(this.element, nextProps.form, options);
      this.createPromise = this.instance.ready.then((formio) => {
        this.formio = formio;
        this.formio.form = nextProps.form;
      });
      this.initializeFormio();
    }

    if (submission !== nextProps.submission && this.formio) {
      this.formio.submission = nextProps.submission;
    }
  };

  render = () => {
    return <div data-testid="formMountElement" ref={(element) => (this.element = element)} />;
  };
}

function focusAndScrollToNextAndPreviousPage() {
  const nextOrPreviousPage = document.querySelector("main");
  const nextOrPreviousTitle = document.querySelector(".typo-innholdstittel");
  nextOrPreviousTitle.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
  nextOrPreviousPage.focus({ preventScroll: true });
}
