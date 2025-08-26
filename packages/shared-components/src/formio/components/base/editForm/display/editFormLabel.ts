import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormLabel = (): Component => {
  return {
    type: 'textfield',
    key: 'label',
    label: 'Ledetekst',
    input: true,
    validate: {
      required: true,
    },
  };
};

export default editFormLabel;
