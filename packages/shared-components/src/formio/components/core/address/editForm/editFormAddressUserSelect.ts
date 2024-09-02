import { Component } from '@navikt/skjemadigitalisering-shared-domain';

interface PropertyOptions {
  customConditional?: string;
}

const editFormAddressUserSelect = (options: PropertyOptions): Component => {
  return {
    type: 'checkbox',
    label: 'Brukerstyrt adressetype',
    key: 'addressUserSelect',
    defaultValue: false,
    clearOnHide: true,
    customConditional: options.customConditional,
  };
};

export default editFormAddressUserSelect;
