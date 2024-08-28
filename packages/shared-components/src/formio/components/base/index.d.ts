import { Component, FormPropertiesType, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
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
  updateValue(value, flags?: object): any;
  setReactInstance(element): void;
  resetValue(): void;
  setValue(value: any): void;
  // Field
  render(element: any): any;
  // Component
  key?: string;
  component?: Component;
  element: any;
  localRoot?: ReactComponentType;
  parent?: ReactComponentType;
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
    properties: FormPropertiesType;
    parentPath: string;
    server: boolean;
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
  redraw(): any;
  renderTemplate(name: string, data?: any, modeOption?: string): any;
  attach(element: any): any;
  detach(): void;
  destroy(): void;
  clear(): void;
  beforeSubmit(): any;
  updateOnChange(flags: any, changed: boolean | any): boolean;
  conditionallyVisible(data?: any): boolean;
  calculateValue(data: object, flags: any, row?: any): boolean;
  t: TFunction;
  loadRefs(element: any, refs: any): any;
  getRef(name: any): any;
  setRef(name: any, ref: any): void;
  checkValidity(data: any, dirty: any | boolean, row: any, silentCheck: boolean): boolean;
  checkComponentValidity(data, dirty, row, options = {});
  checkConditions(data, flags, row): boolean;
  checkData(data?, flags?, row?, components?): boolean;
  checkModal(isValid: boolean, dirty: boolean): void;
  getValue(): any;
  hasChanged(before: any, after: any): boolean;
  clearOnHide(show?: boolean): void;
  deleteValue(): void;
  hasValue(): boolean;
  rootValue: any;
  setComponentValidity(messages, dirty, silentCheck): boolean;
  shouldSkipValidation(data, dirty, row): boolean;
  addMessages(messages): void;
  addFocusBlurEvents(element): void;
  labelIsHidden(): boolean;
  setCustomValidity(messages: string | string[], dirty?: boolean, external?: boolean): void;
  isEmpty(value?: any): boolean;
  isInputComponent(): boolean;
  allowData: boolean;
  // Element
  id?: any;
  hook(...arguments: any[]): any;
  emit(event: string, data: object): void;
  addEventListener(obj, type, func, persistent?);
}
