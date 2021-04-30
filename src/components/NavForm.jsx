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
import { Form as FormioForm, Formio } from "formiojs";
import "nav-frontend-skjema-style";
import i18nData from "../i18nData";
import { styled } from "@material-ui/styles";
import { scrollToAndSetFocus } from "../util/focus-management";
import { useAmplitude } from "../context/amplitude";
import navFormStyle from "./navFormStyle";

const Wizard = Formio.Displays.displays.wizard;
const originalNextPage = Wizard.prototype.nextPage;
const originalSubmit = Wizard.prototype.submit;

Wizard.prototype.attach = function (element) {
  this.element = element;
  this.loadRefs(element, {
    [this.wizardKey]: "single",
    [`${this.wizardKey}-cancel`]: "single",
    [`${this.wizardKey}-previous`]: "single",
    [`${this.wizardKey}-next`]: "single",
    [`${this.wizardKey}-submit`]: "single",
    [`${this.wizardKey}-link`]: "multiple",
    [`${this.wizardKey}-stepindicator-next`]: "single",
    [`${this.wizardKey}-stepindicator-previous`]: "single",
    [`${this.wizardKey}-tooltip`]: "multiple",
  });
  if ((this.options.readOnly || this.editMode) && !this.enabledIndex) {
    if (this.pages) {
      this.enabledIndex = this.pages.length - 1;
    }
  }

  const promises = this.attachComponents(this.refs[this.wizardKey], [
    ...this.prefixComps,
    ...this.currentPage.components,
    ...this.suffixComps,
  ]);
  this.attachNav();
  this.attachHeader();
  return promises.then(() => {
    this.emit("render", { component: this.currentPage, page: this.page });
    if (this.component.scrollToTop) {
      this.scrollPageToTop();
    }
  });
};
Wizard.prototype.attachHeader = function () {
  const isAllowPrevious = this.isAllowPrevious();

  if (this.isBreadcrumbClickable() || isAllowPrevious) {
    this.refs[`${this.wizardKey}-link`].forEach((link, index) => {
      if (!isAllowPrevious || index <= this.enabledIndex) {
        this.addEventListener(link, "click", (event) => {
          this.emit("wizardNavigationClicked", this.pages[index]);
          event.preventDefault();
          return this.setPage(index)
            .then(() => {
              this.emitWizardPageSelected(index);
            })
            .then(() => {
              document.querySelector(".stegindikator__steg-inner--aktiv").focus();
            });
        });
      }
    });
  }

  const previousRefId = `${this.wizardKey}-stepindicator-previous`;
  const nextRefId = `${this.wizardKey}-stepindicator-next`;
  const addPageSwitchFunction = (newPage, nextOrPreviousRefId) => {
    this.addEventListener(this.refs[nextOrPreviousRefId], "click", (event) => {
      this.emit("wizardNavigationClicked", newPage);
      event.preventDefault();
      return this.setPage(newPage)
        .then(() => {
          this.emitWizardPageSelected(newPage);
        })
        .then(() => {
          const nextOrPreviousButton = document.querySelector(`[ref='${nextOrPreviousRefId}']`);

          if (nextOrPreviousButton) {
            nextOrPreviousButton.focus();
          } else if (nextOrPreviousRefId === previousRefId) {
            document.querySelector(".stegindikator__steg:first-of-type .stegindikator__steg-inner").focus();
          } else if (nextOrPreviousRefId === nextRefId) {
            document.querySelector(".stegindikator__steg:last-of-type .stegindikator__steg-inner").focus();
          }
        });
    });
  };
  addPageSwitchFunction(this.getPreviousPage(), previousRefId);
  addPageSwitchFunction(this.getNextPage(), nextRefId);
};

function overrideFormioWizardNextPageAndSubmit(form, loggSkjemaStegFullfort, loggSkjemaValideringFeilet) {
  Wizard.prototype.nextPage = function () {
    return originalNextPage
      .call(this)
      .then((returnValue) => {
        loggSkjemaStegFullfort();
        return returnValue;
      })
      .catch((error) => {
        scrollToAndSetFocus("div[id^='error-list-'] li:first-of-type");
        loggSkjemaValideringFeilet();
        return Promise.reject(error);
      });
  };
  Wizard.prototype.submit = function () {
    return originalSubmit
      .call(this)
      .then((returnValue) => {
        loggSkjemaStegFullfort();
        return returnValue;
      })
      .catch((error) => {
        scrollToAndSetFocus("div[id^='error-list-'] li:first-of-type");
        loggSkjemaValideringFeilet();
        return Promise.reject(error);
      });
  };
}

class NavForm extends Component {
  static propTypes = {
    className: PropTypes.string,
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
    loggSkjemaStegFullfort: PropTypes.func,
    loggSkjemaValideringFeilet: PropTypes.func,
  };

  static defaultProps = {
    options: {
      language: "nb-NO",
      i18n: i18nData,
    },
    onNextPage: () => scrollToAndSetFocus(".wizard-page input, .wizard-page textarea, .wizard-page select", "center"),
    onPrevPage: () => scrollToAndSetFocus(".wizard-page input, .wizard-page textarea, .wizard-page select", "center"),
  };

  static getDefaultEmitter() {
    return new EventEmitter({
      wildcard: false,
      maxListeners: 0,
    });
  }

  componentDidMount = () => {
    const { options, src, url, form } = this.props;
    console.log("Options: ", options);

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

        window.setLanguage = (lang) => {
          this.formio.language = lang;
        };

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
    overrideFormioWizardNextPageAndSubmit(
      this.props.form,
      this.props.loggSkjemaStegFullfort,
      this.props.loggSkjemaValideringFeilet
    );
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
    return (
      <div
        className={this.props.className}
        data-testid="formMountElement"
        ref={(element) => (this.element = element)}
      />
    );
  };
}

const withAmplitudeHooks = (Component) => {
  return (props) => {
    const { loggSkjemaStegFullfort, loggSkjemaValideringFeilet } = useAmplitude();
    return (
      <Component
        loggSkjemaStegFullfort={loggSkjemaStegFullfort}
        loggSkjemaValideringFeilet={loggSkjemaValideringFeilet}
        {...props}
      />
    );
  };
};

export default styled(withAmplitudeHooks(NavForm))(navFormStyle);
