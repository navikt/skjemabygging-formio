import { ReactComponent } from '@formio/react';
import { createRoot } from 'react-dom/client';
import { IReactComponent } from './index';

class FormioReactComponent extends (ReactComponent as unknown as IReactComponent) {
  hasErrorMessage: boolean;
  rootElement: any;

  constructor(component, options, data) {
    super(component, options, data);
    this.hasErrorMessage = false;
  }

  attachReact(element: any) {
    this.rootElement = createRoot(element);

    this.renderReact(this.rootElement);
  }

  detachReact(element) {
    if (element && this.rootElement) {
      setTimeout(() => this.rootElement.unmount());
    }
  }

  setValue(value: any) {
    if (this.reactInstance) {
      this.reactInstance.defaultValue = value;
      this.shouldSetValue = false;
    } else {
      this.shouldSetValue = true;
      this.dataForSetting = value;
    }
    this.dataValue = value;
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

  addMessages(_messages) {
    // This empty method makes sure Formio do not add messages since we want to handle all messages.
  }

  setComponentValidity(messages, dirty, silentCheck) {
    const isValid = super.setComponentValidity(messages, dirty, silentCheck);
    if (!!this.error?.message != this.hasErrorMessage) {
      this.hasErrorMessage = !!this.error?.message;
      this.rerender();
    }
    return isValid;
  }
}

export default FormioReactComponent;
