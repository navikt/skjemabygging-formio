import { Component } from '@navikt/skjemadigitalisering-shared-domain';

export interface IField {
  new (component, options, data): FieldType;

  prototype: FieldType;

  schema(sources: any): any;
}

export interface FieldType {
  shouldSetValue?: any;
  dataForSetting?: any;
  reactInstance?: any;

  attachReact(element, ref): any;

  detachReact(element): any;

  validate(data, dirty, rowData): boolean;

  updateValue: (value, flags?: {}) => any;

  setReactInstance(element): void;

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

  setValue(value: any, flags: any): void;

  hasChanged(before: any, after: any): boolean;

  clearOnHide(): void;

  deleteValue(): void;

  hasValue(): boolean;

  // Element
  id?: any;

  emit(event: string, data: Object): void;
}
