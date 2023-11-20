import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormLabel = (): Component => {
  return {
    type: 'textfield',
    input: true,
    key: 'autocomplete',
    label: 'Autocomplete',
  };
};

export default editFormLabel;
