import { Component, FormPropertiesType, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { TFunction, TOptions } from 'i18next';
import Select from 'react-select/base';
import { AppConfigContextType } from '../../../context/config/configContext';

interface IReactComponent {
  new (component, options, data): ReactComponentType;
  prototype: ReactComponentType;
  schema(sources?: any): any;
  editForm(): any;
}

interface INestedComponent {
  new (component, options, data): NestedComponentType;
  prototype: NestedComponentType;
  schema(sources?: any): any;
  editForm(): any;
}

interface IBaseComponent {
  editFields: string[];
  get defaultSchema(): any;
  render(element: any): any;
  getEditFields(): string[];
  translate(key?: string, options: TOptions = {}): ReturnType<TFunction>;
}

type FormioField = {
  //Field
  render(element: any): any;
  // Component
  key?: string;
  component?: Component;
  path?: string;
  defaultValue?: any;
  dataValue?: any;
  refs?: any;
  get errors(): any[];
  root: any;
  options: {
    appConfig: AppConfigContextType;
    readOnly: boolean;
    namespace: string;
    formConfig: { publishedForm: NavFormType };
    properties: FormPropertiesType;
  };
  visible: any | boolean;
  hideLabel: boolean;
  dirty: boolean;
  error?: {
    message: string;
  } | null;
  builderMode: boolean;
  validators: any[];
  init(options?: object): any;
  renderTemplate(name: string, data: any, modeOption?: any): any;
  redraw(): any;
  attach(element: any): any;
  detach(): void;
  destroy(): void;
  beforeSubmit(): any;
  updateOnChange(flags: any, changed: boolean | any): boolean;
  t: (...args: any[]) => string;
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
  setCustomValidity(messages: string | string[], dirty?: boolean, external?: boolean): void;
  isEmpty(value?: any): boolean;
  // Element
  id?: any;
  emit(event: string, data: object): void;
  hook(...args: any[]): any;
  addEventListener(obj, type, func, persistent?);
};

type NestedComponentType = {
  components: Component[];
  attachComponents(element: any, components?: Component[], container?: any): any;
  renderComponents(components: Component[]): any;
  getComponents(): Component[];
} & FormioField;

type ReactComponentType = {
  data?: any;
  shouldSetValue?: any;
  dataForSetting?: any;
  reactInstance?: HTMLInputElement | Select;
  attachReact(element, ref): any;
  detachReact(element): any;
  get dataReady(): Promise<any>;
  validate(data, dirty, rowData): boolean;
  updateValue(value, flags?: object): any;
  setReactInstance(element): void;
  resetValue(): void;
  setValue(value: any): void;
} & FormioField;
