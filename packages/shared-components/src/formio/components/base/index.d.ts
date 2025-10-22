import { Component, ComponentError, FormPropertiesType, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import Select from 'react-select/base';
import { AppConfigContextType } from '../../../context/config/configContext';
interface IReactComponent {
  new (component, options, data): ReactComponentType;
  prototype: ReactComponentType;
  schema(sources?: any): any;
  editForm(): any;
}

interface ReactComponentType {
  data?: any;
  get rootValue(): any;
  shouldSetValue?: any;
  dataForSetting?: any;
  reactInstance?: HTMLInputElement | Select;
  dataReady: Promise<any>;
  attachReact(element, ref): any;
  detachReact(element): any;
  validate(data, dirty, rowData): boolean;
  updateValue(value, flags?: object): any;
  calculateComponentValue(data, dirty, rowData): any;
  setReactInstance(element): void;
  resetValue(): void;
  setValue(value: any, flags?: any): void;
  // Field
  render(element: any): any;
  // Component
  key?: string;
  component?: Component;
  path?: string;
  defaultValue?: any;
  dataValue?: any;
  refs?: any;
  errors: any[];
  root: any;
  options: {
    appConfig: AppConfigContextType;
    floatingLabels: boolean;
    inputsOnly: boolean;
    readOnly: boolean;
    namespace: string;
    formConfig: { publishedForm: NavFormType };
    properties: FormPropertiesType;
    preview: boolean;
    editComponent: any;
  };
  visible: any | boolean;
  hideLabel: boolean;
  dirty: boolean;
  pristine: boolean;
  error?: {
    message: string;
  } | null;
  builderMode: boolean;
  validators: any[];
  init(options?: object): any;
  redraw(): any;
  attach(element: any): any;
  detach(): void;
  destroy(): void;
  beforeSubmit(): any;
  updateOnChange(flags: any, changed: boolean | any): boolean;
  t: TFunction;
  loadRefs(element: any, refs: any): any;
  getRef(name: any): any;
  setRef(name: any, ref: any): void;
  checkValidity(data: any, dirty: any | boolean, row: any, silentCheck: boolean): boolean;
  checkComponentValidity(data, dirty, row, options = {});
  getValue(): any;
  hasChanged(before: any, after: any): boolean;
  clearOnHide(): void;
  deleteValue(): void;
  hasValue(): boolean;
  setComponentValidity(messages, dirty, silentCheck): boolean;
  shouldSkipValidation(data, dirty, row): boolean;
  addMessages(messages): void;
  addFocusBlurEvents(element): void;
  labelIsHidden(): boolean;
  setCustomValidity(messages: string | string[] | ComponentError[], dirty?: boolean, external?: boolean): void;
  isEmpty(value?: any): boolean;
  triggerChange(flags?: any): boolean;
  parent?: ReactComponentType;
  type: string;
  // Element
  id?: any;
  emit(event: string, data: object): void;
  addEventListener(obj, type, func, persistent?);
}
