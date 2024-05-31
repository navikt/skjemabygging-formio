import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormInputType = (): Component => {
  return {
    type: 'select',
    label: 'Input type',
    key: 'inputType',
    dataSrc: 'values',
    data: {
      values: [
        { label: 'Desimaltall', value: 'decimal' },
        { label: 'Heltall', value: 'numeric' },
      ],
    },
  };
};

export default editFormInputType;
