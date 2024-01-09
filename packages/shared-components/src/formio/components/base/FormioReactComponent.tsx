import { ReactComponent } from '@formio/react';
import { createRoot } from 'react-dom/client';
import { IReactComponent } from './index';

class FormioReactComponent extends (ReactComponent as unknown as IReactComponent) {
  componentMessage?: string;
  rootElement: any;

  constructor(component, options, data) {
    super(component, options, data);
    this.componentMessage = undefined;
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
    if (this.reactInstance) (this.reactInstance as HTMLInputElement).defaultValue = value;
  }

  setValue(value: any) {
    const rerender = JSON.stringify(value) !== JSON.stringify(this.dataForSetting);
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
  }

  /**
   * To render a react component, override this function
   * and pass the jsx element as a param to element's render function
   */
  renderReact(_element) {}

  rerender() {
    if (this.rootElement) {
      this.renderReact(this.rootElement);
    }
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
  setComponentValidity(messages, dirty, silentCheck) {
    const isValid = super.setComponentValidity(messages, dirty, silentCheck);
    if (this.error?.message !== this.componentMessage) {
      this.componentMessage = this.error?.message;
      this.rerender();
    }
    return isValid;
  }
}

export default FormioReactComponent;
