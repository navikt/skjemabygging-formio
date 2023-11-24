import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormFieldSizeField = (): Component => {
  return {
    type: 'select',
    label: 'Feltstørrelse',
    key: 'fieldSize',
    dataSrc: 'values',
    data: {
      values: [
        { label: 'XXL (standard)', value: 'input--xxl' },
        { label: 'XL', value: 'input--xl' },
        { label: 'L', value: 'input--l' },
        { label: 'M', value: 'input--m' },
        { label: 'S', value: 'input--s' },
        { label: 'XS', value: 'input--xs' },
      ],
    },
    input: true,
    validate: {
      required: false,
    },
  };
};

export default editFormFieldSizeField;
