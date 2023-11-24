import { ReactComponent } from '@formio/react';
import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { createRoot } from 'react-dom/client';

interface IReactComponent {
  new (component, options, data): ReactComponentType;
  prototype: ReactComponentType;
  schema(sources: any): any;
  //
  // reactInstance: any;
  // init(): any;
  // destroy(): any;
  // beforeSubmit(): any;
  // render(): string;
  // setReactInstance(element: any): void;
  // attach(element: any): Promise<void>;
  // detach(): void;
  // attachReact(element: any, ref: any): void;
  // detachReact(element: any): void;
  // setValue(value: any): void;
  // shouldSetValue: boolean;
  // dataForSetting: any;
  // updateValue: (value: any, flags: any) => any;
  // dataValue: any;
  // getValue(): any;
  // checkValidity(data: any, dirty: any, rowData: any): boolean;
  // validate(data: any, dirty: any, rowData: any): boolean;
}

interface ReactComponentType {
  shouldSetValue?: any;
  dataForSetting?: any;
  reactInstance?: HTMLInputElement;
  attachReact(element, ref): any;
  detachReact(element): any;
  validate(data, dirty, rowData): boolean;
  updateValue: (value, flags?: {}) => any;
  setReactInstance(element): void;
  setValue(value: any): void;

  // Field
  render(element: any): any;
  // Component
  component?: Component;
  defaultValue?: any;
  dataValue?: any;
  refs?: any;
  errors: any[];
  root: any;
  options: any;
  visible: any | boolean;
  error?: {
    message: string;
  } | null;
  init(): any;
  redraw(): any;
  attach(element: any): any;
  detach(): void;
  destroy(): void;
  beforeSubmit(): any;
  updateOnChange(flags: any, changed: boolean | any): boolean;
  t(text: string, params?: any): any;
  loadRefs(element: any, refs: any): any;
  checkValidity(data: any, dirty: any | boolean, rowData: any): boolean;
  getValue(): any;
  hasChanged(before: any, after: any): boolean;
  clearOnHide(): void;
  deleteValue(): void;
  hasValue(): boolean;
  setComponentValidity(messages, dirty, silentCheck): boolean;
  // Element
  id?: any;
  emit(event: string, data: Object): void;
  addEventListener(obj, type, func, persistent?);
}

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
    this.updateValue(value);
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
