import { Component } from '@navikt/skjemadigitalisering-shared-domain';

interface PropertyOptions {
  customConditional?: string;
}

const editFormAddressTypeWizard = (options: PropertyOptions): Component => {
  return {
    type: 'radio',
    label: 'Skal bruker velge adressetype?',
    key: 'addressTypeWizard',
    defaultValue: 'predefined',
    values: [
      {
        value: 'predefined',
        label: 'Nei, adressetype skal være predefinert',
      },
      {
        value: 'user',
        label: 'Ja, bruker må oppgi om de bor i Norge og adresstypen',
      },
    ],
    validate: {
      required: true,
    },
    customConditional: options.customConditional,
  };
};

export default editFormAddressTypeWizard;
