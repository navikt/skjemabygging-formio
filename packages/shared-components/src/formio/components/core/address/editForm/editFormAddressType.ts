import { AddressType, Component } from '@navikt/skjemadigitalisering-shared-domain';

interface PropertyOptions {
  customConditional?: string;
}

type AddressComponent = Component & {
  values: {
    value: AddressType;
    label: string;
  }[];
};

const editFormAddressType = (options: PropertyOptions): AddressComponent => {
  return {
    type: 'radiopanel',
    label: 'Adressetype',
    key: 'addressType',
    input: true,
    values: [
      {
        value: 'NORWEGIAN_ADDRESS',
        label: 'Vegadresse',
      },
      {
        value: 'POST_OFFICE_BOX',
        label: 'Postboksadresse',
      },
      {
        value: 'FOREIGN_ADDRESS',
        label: 'Utenlandsk adresse',
      },
    ],
    validate: {
      required: true,
    },
    clearOnHide: true,
    customConditional: options.customConditional,
  };
};

export default editFormAddressType;
