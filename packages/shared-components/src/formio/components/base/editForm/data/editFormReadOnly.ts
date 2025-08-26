import { Component } from '@navikt/skjemadigitalisering-shared-domain';

interface ReadOnlyOptions {
  hidden?: boolean;
  clearOnHide?: boolean;
  calculateValue?: string;
}

const editFormReadOnly = (options?: ReadOnlyOptions): Component => {
  return {
    type: 'checkbox',
    input: true,
    label: 'Skrivebeskyttet',
    key: 'readOnly',
    defaultValue: false,
    hidden: !!options?.hidden,
    clearOnHide: options?.clearOnHide ? true : false,
    calculateValue: options?.calculateValue,
  };
};

export default editFormReadOnly;
