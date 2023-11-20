import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormLabel = (): Component => {
  return {
    type: 'textfield',
    key: 'label',
    label: 'Ledetekst',
    validate: {
      required: true,
    },
    input: true,
  };
};

export default editFormLabel;
