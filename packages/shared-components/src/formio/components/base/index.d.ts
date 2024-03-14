import { Component, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { TFunction } from 'i18next';
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
  shouldSetValue?: any;
  dataForSetting?: any;
  reactInstance?: HTMLInputElement | Select;
  dataReady: Promise<any>;
  attachReact(element, ref): any;
  detachReact(element): any;
  validate(data, dirty, rowData): boolean;
  updateValue(value, flags?: {}): any;
  setReactInstance(element): void;
  resetValue(): void;
  setValue(value: any): void;
  // Field
  render(element: any): any;
  // Component
  component?: Component;
  path?: string;
  defaultValue?: any;
  dataValue?: any;
  refs?: any;
  errors: any[];
  root: any;
  options: {
    appConfig: AppConfigContextType;
    readOnly: boolean;
    namespace: string;
    formConfig: { publishedForm: NavFormType };
  };
  visible: any | boolean;
  hideLabel: boolean;
  error?: {
    message: string;
  } | null;
  builderMode: boolean;
  validators: any[];
  init(options?: {}): any;
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
  checkValidity(data: any, dirty: any | boolean, rowData: any): boolean;
  getValue(): any;
  hasChanged(before: any, after: any): boolean;
  clearOnHide(): void;
  deleteValue(): void;
  hasValue(): boolean;
  setComponentValidity(messages, dirty, silentCheck): boolean;
  addMessages(messages): void;
  addFocusBlurEvents(element): void;
  labelIsHidden(): boolean;
  setCustomValidity(messages: object, dirty?: boolean, external?: boolean): void;
  // Element
  id?: any;
  emit(event: string, data: Object): void;
  addEventListener(obj, type, func, persistent?);
}
