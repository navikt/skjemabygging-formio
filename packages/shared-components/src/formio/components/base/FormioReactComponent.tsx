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
    // For now we prefer memory leak in development over spamming the console log...
    // Wrapping in setTimeout causes problems when we do a redraw, so need to find a different solution.
    // https://github.com/facebook/react/issues/25675#issuecomment-1518272581
    if (element && this.rootElement && process.env.NODE_ENV !== 'development') {
      this.rootElement.unmount();
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
    if (this.error?.message !== this.componentMessage) {
      this.componentMessage = this.error?.message;
      this.rerender();
    }
    return isValid;
  }
}

export default FormioReactComponent;
