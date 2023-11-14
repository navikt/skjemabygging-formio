import { ReactComponent } from '@formio/react';
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
  component?: import('@navikt/skjemadigitalisering-shared-domain/src').Component;
  defaultValue?: any;
  dataValue?: any;
  refs?: any;
  errors: any[];
  root: any;
  options: any;
  visible: any | boolean;
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
  // Element
  id?: any;
  emit(event: string, data: Object): void;
}

class FormioReactComponent extends (ReactComponent as unknown as IReactComponent) {
  static schema(sources) {
    super.schema(sources);
  }

  // ref = createRef<HTMLInputElement>();

  attachReact(element: any) {
    const root = createRoot(element);
    this.renderReact(root);
  }

  detachReact(element) {
    if (element && this.reactInstance) {
      setTimeout(() => {
        // this.reactInstance.unmount();
        // this.reactRoot.unmount();
        this.reactInstance = undefined;
      });
    }
  }

  setReactInstance(element) {
    console.log('setReactInstance', element);
    super.setReactInstance(element);
  }

  setValue(value: any) {
    console.log('setValue', this.component?.key, value);
    console.log('setVal reactInstance', this.reactInstance);
    console.log('setVal shouldSetValue', this.shouldSetValue);
    console.log('setVal dataValue', this.dataValue);
    console.log('setVal valueForSetting', this.dataForSetting);
    if (this.reactInstance) {
      this.reactInstance.defaultValue = value;
      this.shouldSetValue = false;
    } else {
      this.shouldSetValue = true;
      this.dataForSetting = value;
    }
  }

  getValue() {
    return super.getValue();
  }

  /**
   * To render a react component, override this function and pass the jsx element as a param to element's render function
   *
   * @param element
   */
  renderReact(_element) {}
}

export default FormioReactComponent;
