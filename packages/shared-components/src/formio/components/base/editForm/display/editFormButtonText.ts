import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormButtonText = (): Component => {
  return {
    type: 'textfield',
    key: 'buttonText',
    label: 'Tekst',
    validate: {
      required: true,
    },
  };
};

export default editFormButtonText;
