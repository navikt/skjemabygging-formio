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

import { makeStyles } from "@material-ui/styles";
import EventEmitter from "eventemitter2";
import { Form as FormioForm, Utils } from "formiojs";
import "nav-frontend-skjema-style";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { useAppConfig } from "../configContext";
import { useAmplitude } from "../context/amplitude";
import { evaluateOverride, overrideFormioTextField, overrideFormioWizardNextPageAndSubmit } from "../formio-overrides";
import i18nData from "../i18nData";
import { SANITIZE_CONFIG } from "../template/sanitizeConfig";
import { scrollToAndSetFocus } from "../util/focus-management";
import formioFormStyles from "./styles/formioFormStyles";

Utils.evaluate = evaluateOverride;

const useStyles = makeStyles({
  "@global": {
    ...formioFormStyles,
  },
});

const NavForm = (props) => {
  let instance;
  let createPromise;
  let element;
  const [formio, setFormio] = useState(undefined);
  useStyles();
  const { featureToggles } = useAppConfig();

  useEffect(() => {
    overrideFormioTextField(featureToggles.enableAutoComplete);
  }, []);

  useEffect(
    () => () => {
      if (formio) {
        formio.destroy(true);
      }
    },
    [formio]
  );

  const createWebformInstance = (srcOrForm) => {
    const { formioform, formReady, language, i18n } = props;
    instance = new (formioform || FormioForm)(element, srcOrForm, {
      language,
      i18n,
      sanitizeConfig: SANITIZE_CONFIG,
      events: NavForm.getDefaultEmitter(),
    });
    createPromise = instance.ready.then((formioInstance) => {
      if (formio) {
        formio.destroy(true);
      }
      setFormio(formioInstance);
      if (formReady) {
        formReady(formioInstance);
      }
    });

    return createPromise;
  };

  const onAnyEvent = (event, ...args) => {
    if (event.startsWith("formio.")) {
      const funcName = `on${event.charAt(7).toUpperCase()}${event.slice(8)}`;
      // eslint-disable-next-line no-prototype-builtins
      if (props.hasOwnProperty(funcName) && typeof props[funcName] === "function") {
        props[funcName](...args);
      }
    }

    // Repopulating form from submission after navigating back to form from another context (e.g. Summary page)
    if (event === "formio.change" && args?.some((arg) => arg?.fromSubmission)) {
      instance.ready.then((formioInstance) => {
        if (formio) {
          formio.destroy(true);
        }
        setFormio(formioInstance);
        if (props.formReady) {
          props.formReady(formioInstance);
        }
      });
    }
  };

  const initializeFormio = () => {
    const { submission } = props;
    if (createPromise) {
      instance.onAny(onAnyEvent);
      createPromise.then(() => {
        if (formio && submission) {
          formio.submission = JSON.parse(JSON.stringify(submission));
        }
      });
    }
  };

  useEffect(() => {
    const { src } = props;
    if (src) {
      createWebformInstance(src).then(() => {
        if (formio) {
          formio.src = src;
        }
      });
      initializeFormio();
    }
  }, [props.src, props.i18n]);

  useEffect(() => {
    const { form, url } = props;
    if (form) {
      createWebformInstance(form).then(() => {
        if (formio) {
          formio.form = form;
          if (url) {
            formio.url = url;
          }
          return formio;
        }
      });
      initializeFormio();
    }
  }, [props.form, props.i18n]);

  useEffect(() => {
    if (formio) {
      formio.language = props.language;
    }
  }, [props.language]);

  useEffect(() => {
    overrideFormioWizardNextPageAndSubmit(props.loggSkjemaStegFullfort, props.loggSkjemaValideringFeilet);
  }, [props.loggSkjemaStegFullfort, props.loggSkjemaValideringFeilet]);

  useEffect(() => {
    const { submission } = props;
    if (formio && submission) {
      formio.submission = JSON.parse(JSON.stringify(submission));
    }
  }, [props.submission, formio]);

  return <div className={props.className} data-testid="formMountElement" ref={(el) => (element = el)} />;
};

NavForm.propTypes = {
  className: PropTypes.string,
  src: PropTypes.string,
  url: PropTypes.string,
  form: PropTypes.object,
  submission: PropTypes.object,
  i18n: PropTypes.object,
  language: PropTypes.string,
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
  formReady: PropTypes.func,
  formioform: PropTypes.any,
};

NavForm.defaultProps = {
  language: "nb-NO",
  i18n: i18nData,
  onNextPage: () => scrollToAndSetFocus(".wizard-page input, .wizard-page textarea, .wizard-page select", "center"),
  onPrevPage: () => scrollToAndSetFocus(".wizard-page input, .wizard-page textarea, .wizard-page select", "center"),
};

NavForm.getDefaultEmitter = () => {
  return new EventEmitter({
    wildcard: false,
    maxListeners: 0,
  });
};

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

export default withAmplitudeHooks(NavForm);
