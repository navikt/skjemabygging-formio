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
import { navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import EventEmitter from 'eventemitter2';
import { Form as FormioForm } from 'formiojs';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useAppConfig } from '../../context/config/configContext';
import { usePrefillData } from '../../context/prefill-data/PrefillDataContext';
import { SANITIZE_CONFIG } from '../../formio/form-builder-options/sanitizeConfig';
import Styles from '../../styles';
import i18nUtils from '../../util/i18n';
import makeStyles from '../../util/styles/jss/jss';

const useStyles = makeStyles({
  '@global': Styles.form,
});

const NavForm = ({ language = 'nb-NO', i18n = i18nUtils.initialData, ...props }) => {
  let instance;
  let createPromise;
  let element;
  const [formio, setFormio] = useState(undefined);
  useStyles();
  const { prefillData } = usePrefillData();
  const appConfig = useAppConfig();

  useEffect(
    () => () => {
      if (formio) {
        appConfig.logger?.debug('Destroy formio on unmount', { formioId: formio.id });
        formio.destroy(true);
      }
    },
    [formio],
  );

  useEffect(() => {
    const { fyllutEvents } = props;
    fyllutEvents?.on('focusOnComponent', (args) => formio.focusOnComponent(args));
    return () => fyllutEvents?.removeListener('focusOnComponent');
  }, [props.fyllutEvents, formio]);

  const createWebformInstance = (srcOrForm) => {
    const { formioform, formReady } = props;
    appConfig.logger?.debug('create webform instance', {
      formioId: formio?.id,
      form: srcOrForm.properties?.skjemanummer || srcOrForm,
      language,
    });
    instance = new (formioform || FormioForm)(element, srcOrForm, {
      language,
      i18n,
      sanitizeConfig: SANITIZE_CONFIG,
      events: NavForm.getDefaultEmitter(),
      appConfig,
    });

    createPromise = instance.ready.then((formioInstance) => {
      appConfig.logger?.debug('Formio ready', { formioId: formioInstance.id, oldFormioId: formio?.id });
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
    appConfig.logger?.trace(`formio event '${event}'`, { formioId: formio?.id, eventArgs: args });
    if (event.startsWith('formio.')) {
      const funcName = `on${event.charAt(7).toUpperCase()}${event.slice(8)}`;
      // eslint-disable-next-line no-prototype-builtins
      if (props.hasOwnProperty(funcName) && typeof props[funcName] === 'function') {
        props[funcName](...args);
      }
    }

    // Repopulating form from submission after navigating back to form from another context (e.g. Summary page)
    if (event === 'formio.change' && args?.some((arg) => arg?.fromSubmission)) {
      instance.ready.then((formioInstance) => {
        if (props.submissionReady) {
          props.submissionReady(formioInstance);
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
    if (src && Object.keys(i18n).length !== 0) {
      createWebformInstance(src).then(() => {
        if (formio) {
          formio.src = src;
        }
      });
      initializeFormio();
    }
  }, [props.src, i18n]);

  useEffect(() => {
    const { form, url } = props;
    if (form && Object.keys(i18n).length !== 0) {
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
  }, [props.form, i18n]);

  useEffect(() => {
    if (formio) {
      appConfig.logger?.debug('set language', { formioId: formio?.id, language });
      formio.language = language;
    }
  }, [language]);

  useEffect(() => {
    if (formio && props.submission) {
      appConfig.logger?.debug('set submission', { formioId: formio?.id });
      formio.setSubmission(JSON.parse(JSON.stringify(props.submission))).then(() => {
        if (props.submission.fyllutState) {
          formio.redrawNavigation();
        }
      });
    }
    if (formio && prefillData) {
      appConfig.logger?.debug('prefill data and set form', { formioId: formio?.id, prefillData });
      formio.form = navFormUtils.prefillForm(formio.form, prefillData);
    }
  }, [props.submission, formio, prefillData]);

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
  onSave: PropTypes.func,
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
  onWizardPageSelected: PropTypes.func,
  onShowErrors: PropTypes.func,
  onErrorSummaryFocus: PropTypes.func,
  fyllutEvents: PropTypes.object,
  formReady: PropTypes.func,
  submissionReady: PropTypes.func,
  formioform: PropTypes.any,
};

NavForm.getDefaultEmitter = () => {
  return new EventEmitter({
    wildcard: false,
    maxListeners: 0,
  });
};

export default NavForm;
