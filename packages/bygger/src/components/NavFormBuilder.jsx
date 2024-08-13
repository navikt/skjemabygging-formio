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

import { NavFormioJs, makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import cloneDeep from 'lodash.clonedeep';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import '../formio-overrides/builder-utils-overrides';
import '../formio-overrides/webform-builder-overrides';
import { builderStyles } from './styles';

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
  builderState = 'preparing';
  element = React.createRef();
  static propTypes = {
    form: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onReady: PropTypes.func,
    formBuilderOptions: PropTypes.object,
  };

  get logger() {
    const { appConfig } = this.props.formBuilderOptions;
    return appConfig?.logger;
  }

  handleChange = (data) => {
    if (data.type === 'form') {
      this.props.onChange(cloneDeep(this.builder.instance.form));
    }
  };

  traceEvent = (event, ...args) => {
    this.logger?.trace(`FormBuilder event '${event}`, { eventArgs: args });
  };

  createBuilder = (page) => {
    this.logger?.debug('FormBuilder create', { page });
    this.builder = new NavFormioJs.Formio.FormBuilder(
      this.element.current,
      cloneDeep(this.props.form),
      this.props.formBuilderOptions,
    );
    if (page) {
      this.builder.instance?.setPage?.(page);
    }
    this.builderReady = this.builder.ready;
    this.builderReady.then(() => {
      this.logger?.debug('FormBuilder ready');
      this.builder?.instance?.on('change', this.handleChange);
      this.builder?.instance?.onAny(this.traceEvent);
      this.builderState = 'ready';
      if (this.props.onReady) {
        this.props.onReady();
      }
    });
  };

  destroyBuilder = () => {
    this.logger?.debug('FormBuilder destroy');
    this.builder.instance.off('change', this.handleChange);
    this.builder.instance.offAny(this.traceEvent);
    this.builder.instance.destroy(true);
    this.builder.destroy();
    this.builder = null;
    this.builderState = 'destroyed';
  };

  updateFormBuilder() {
    const page = this.builder.instance.page;
    this.destroyBuilder();
    this.createBuilder(page);
  }

  componentDidMount = () => {
    this.createBuilder();
  };

  componentDidUpdate = (prevProps) => {
    const builderInstance = this.builder.instance;
    const prevPublishedForm = prevProps.formBuilderOptions.formConfig.publishedForm;
    const nextPublishedForm = this.props.formBuilderOptions.formConfig.publishedForm;

    if (!navFormUtils.isEqual(nextPublishedForm, prevPublishedForm)) {
      this.logger?.debug('FormBuilder published form changed, will redraw');
      builderInstance.options.formConfig.publishedForm = nextPublishedForm;
      builderInstance.redraw();
    }
    if (navFormUtils.isEqual(builderInstance.form, this.props.form, ['modified'])) {
      this.logger?.debug('FormBuilder form not changed, return');
      return;
    }
    this.logger?.debug('FormBuilder form changed, will update');
    this.updateFormBuilder();
  };

  componentWillUnmount = () => {
    this.destroyBuilder();
  };

  render = () => {
    return (
      <BuilderMountElement
        className={`${this.props.className}`}
        data-testid="builderMountElement"
        setRef={this.element}
      ></BuilderMountElement>
    );
  };
}

export default NavFormBuilder;
