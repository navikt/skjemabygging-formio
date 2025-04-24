import { ReactComponent } from '@formio/react';
import { ComponentError, SubmissionData } from '@navikt/skjemadigitalisering-shared-domain';
import { createRoot } from 'react-dom/client';
import Ready from '../../../util/form/ready';
import baseComponentUtils from './baseComponentUtils';
import createComponentLogger, { ComponentLogger } from './createComponentLogger';
import { blurHandler, focusHandler } from './focus-helpers';
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

  setReactInstance(element, autoResolve: boolean = true) {
    this.addRef(baseComponentUtils.getId(this.component), element);

    this.reactInstance = element;
    this.addFocusBlurEvents(element);
    if (autoResolve) {
      this.reactResolve();
    }
  }

  /**
   * Get app config (same as useAppConfig hook) for custom component renderReact()
   */
  getAppConfig() {
    return this.options?.appConfig;
  }

  getFormConfig() {
    return this.options?.formConfig;
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

  setValue(value: any, flags?: any) {
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

    if (changed || flags?.fromSubmission) {
      this.rerender();
    }
  }

  handleChange(value, flags = {}): any {
    this.updateValue(value, { ...flags, modified: true });
    // The user has updated the value so we should no longer set it to default value
    // This fixes a bug where a redraw from adding a new datagrid row resets input value to "dataForSetting"
    // Consider removing if we are able to render datagrid in react
    this.shouldSetValue = false;

    this.emit('handleChange', { ...this.root._data });
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
   * Resolves when the React component has been rendered.
   */
  get reactReady() {
    return this._reactRendered.promise;
  }

  /**
   * Tell the component that React have finished rendering.
   * Should only be necessary to call if you set autoResolve false in setReactInstance
   */
  reactResolve() {
    this._reactRendered.resolve();
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
   */
  addMessages(messages) {
    this.logger.info('Trying to addMessages with Formio.io old template. Should use new error messages instead', {
      messages,
    });
  }

  /**
   * @return Currently focused component.
   */
  getFocusedComponent() {
    return this.root.focusedComponent;
  }

  /**
   * @return Name of focused element inside currently focused component.
   */
  getFocusedElementId() {
    return this.root.focusedElementId;
  }

  /**
   * Set which component is currently focused, and optionally which element inside this component.
   * This is stored on 'this.root' which usually points to the webform/wizard.
   * @param component
   * @param elementId
   */
  setFocusedComponent(component: FormioReactComponent | null, elementId: any = null) {
    this.logger.trace(`setFocusedComponent ${component ? 'this' : 'null'}`, { elementId });
    this.root.focusedComponent = component;
    this.root.focusedElementId = elementId;
  }

  /**
   * Copied from Formio Component#restoreFocus, and adjusted to our needs.
   * Invoked when component is being attached, e.g. during initial build or on rebuild/redraw.
   */
  restoreFocus() {
    const focusedComponent = this.getFocusedComponent();
    const isFocused = focusedComponent?.path === this.path;
    if (isFocused) {
      const elementId = this.getFocusedElementId();
      this.logger.debug('restoreFocus isFocused', {
        elementId: elementId,
        navId: this.component?.navId,
        type: this.component?.type,
      });
      this.focus({ elementId });
    }
  }

  /**
   * Overrides Formio Component#addFocusBlurEvents. We split the focus and blur handlers
   * in order to be able to reuse them inside our React components.
   * @param element The element
   */
  addFocusBlurEvents(element) {
    this.addEventListener(element, 'focus', focusHandler(this));
    this.addEventListener(element, 'blur', blurHandler(this));
  }

  /**
   * Used to set focus when clicking error summary, and when restoring focus after rerender.
   */
  focus(focusData: any = {}) {
    this.logger.debug('focus', { focusData });
    this.reactReady.then(() => {
      this.logger.debug('focus reactReady', { focusData, reactInstanceExists: !!this.reactInstance });
      const { elementId } = focusData;
      if (elementId) {
        this.getRef(elementId)?.focus();
      } else if (this.reactInstance) {
        this.reactInstance.focus(focusData);
      }
    });
  }

  shouldSkipValidation(data?: SubmissionData, dirty?: boolean, row?: SubmissionData): boolean {
    const formioData = data || this.rootValue;
    const formioRow = row || this.data;

    return super.shouldSkipValidation(formioData, dirty, formioRow);
  }
}

export default FormioReactComponent;
