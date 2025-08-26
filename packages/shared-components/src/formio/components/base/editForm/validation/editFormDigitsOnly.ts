import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormDigitsOnly = (): Component => {
  return {
    type: 'checkbox',
    label: 'Tillat kun siffer (0-9)',
    key: 'validate.digitsOnly',
    input: true,
  };
};

export default editFormDigitsOnly;
