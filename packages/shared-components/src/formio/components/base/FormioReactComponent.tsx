import { ReactComponent } from '@formio/react';
import { ComponentError } from '@navikt/skjemadigitalisering-shared-domain';
import { createRoot } from 'react-dom/client';
import Ready from '../../../util/form/ready';
import createComponentLogger, { ComponentLogger } from './createComponentLogger';
import { IReactComponent } from './index';

class FormioReactComponent extends (ReactComponent as unknown as IReactComponent) {
  rootElement: any;
  componentErrors: ComponentError[];
  _reactRendered = Ready();
  _reactRefs: Record<string, HTMLElement> = {};
  _logger?: ComponentLogger;

  constructor(component, options, data) {
    super(component, options, data);
    this.componentErrors = [];
  }

  get logger(): ComponentLogger {
    if (!this._logger) {
      const prefix = `[${this.component!.navId} ${this.component!.type}] `;
      this._logger = createComponentLogger(this.getAppConfig(), prefix);
    }
    return this._logger;
  }

  build(element: any) {
    return this.attach(element);
  }

  attachReact(element: any) {
    this.rootElement = createRoot(element);
    this.renderReact(this.rootElement);
  }

  setReactInstance(element) {
    this.reactInstance = element;
    this.addFocusBlurEvents(element);
    this._reactRendered.resolve();
  }

  /**
   * Get app config (same as useAppConfig hook) for custom component renderReact()
   */
  getAppConfig() {
    return this.options?.appConfig;
  }

  detachReact(element) {
    // For now we prefer memory leak in development and test over spamming the console log...
    // Wrapping in setTimeout causes problems when we do a redraw, so need to find a different solution.
    // https://github.com/facebook/react/issues/25675#issuecomment-1518272581
    if (element && this.rootElement && process.env.NODE_ENV === 'production') {
      this.rootElement.unmount();
      this.rootElement = undefined;
    }
  }

  getValue() {
    return this.dataValue;
  }

  setValueOnReactInstance(value) {
    if (this.reactInstance) (this.reactInstance as HTMLInputElement).value = value;
  }

  setValue(value: any) {
    this.reactReady.then(() => {
      if (this.reactInstance) {
        this.setValueOnReactInstance(value);
        this.shouldSetValue = false;
      } else if (value) {
        this.shouldSetValue = true;
        this.dataForSetting = value;
      }

      const newValue = value === undefined || value === null ? this.getValue() : value;
      const changed = JSON.stringify(newValue) !== JSON.stringify(this.dataValue);
      this.dataValue = Array.isArray(newValue) ? [...newValue] : newValue;

      if (changed) {
        this.rerender();
      }
    });
  }

  /**
   * Will always hide component if hidden is true, regardless of other conditionals
   */
  shouldForceHide() {
    return this.component?.hidden ?? false;
  }

  /**
   * To render a react component, override this function
   * and pass the jsx element as a param to element's render function
   */
  renderReact(_element) {}

  rerender() {
    if (this.rootElement) {
      this._reactRefs = {};
      this._reactRendered.reset();
      this.renderReact(this.rootElement);
    }
  }

  /**
   * Resolves when the React component has been rendered, and {@link setReactInstance} has been invoked.
   */
  get reactReady() {
    return Promise.all([this._reactRendered.promise, this.reactRefsReady]);
  }

  /**
   * Override to let the component decide when its refs are ready, typically when all
   * ref callbacks have been invoked.
   */
  get reactRefsReady() {
    return Promise.resolve();
  }

  addRef(name: string, ref: HTMLElement | null) {
    if (ref) {
      this._reactRefs[name] = ref;
    } else {
      delete this._reactRefs[name];
    }
  }

  getRef(name: string): HTMLElement | null {
    return this._reactRefs[name];
  }

  /**
   * Add message render the error messages Form.io template.
   *
   * If the component have error message suppport, we would like to use that instead of the template in Form.io.
   */
  addMessages(messages) {
    // TODO: Fjern dette når navSelect bruker komponent fra aksel, og error kan håndteres direkte av komponenten.
    //  Behold addMessages som en tom funksjon
    if (['navSelect', 'landvelger', 'valutavelger'].includes(this.component?.type ?? '')) {
      super.addMessages(messages);
    }
  }

  /**
   * Set error
   */
  override setCustomValidity(messages: string | string[], dirty?: boolean, external?: boolean) {
    const previousErrorMessage = this.error?.message;
    super.setCustomValidity(messages, dirty, external);
    if (this.error?.message !== previousErrorMessage) {
      this.rerender();
    }
  }
}

export default FormioReactComponent;
