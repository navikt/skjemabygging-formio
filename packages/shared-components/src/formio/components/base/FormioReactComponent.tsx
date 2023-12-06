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

  attachReact(element: any) {
    this.rootElement = createRoot(element);
    this.renderReact(this.rootElement);
  }

  detachReact(element) {
    if (element && this.rootElement) {
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
    if (this.reactInstance) {
      this.setValueOnReactInstance(value);
      this.shouldSetValue = false;
    } else {
      this.shouldSetValue = true;
      this.dataForSetting = value;
    }
    const newValue = value === undefined || value === null ? this.getValue() : value;
    this.dataValue = Array.isArray(newValue) ? [...newValue] : newValue;
  }

  /**
   * To render a react component, override this function and pass the jsx element as a param to element's render function
   *
   * @param element
   */
  renderReact(_element) {}

  rerender() {
    if (this.rootElement) {
      this.renderReact(this.rootElement);
    }
  }

  addMessages(messages) {
    // This empty method makes sure Formio do not add messages since we want to handle all messages.

    // TODO: Fjern dette når navSelect bruker komponent fra aksel, og error kan håndteres direkte av komponenten.
    //  Behold addMessages som en tom funksjon
    if (['navSelect', 'landvelger', 'valutavelger'].includes(this.component?.type ?? '')) {
      super.addMessages(messages);
    }
  }

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
