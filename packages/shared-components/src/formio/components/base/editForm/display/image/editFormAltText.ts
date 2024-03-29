import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormAltText = (): Component => {
  return {
    type: 'textfield',
    label: 'Alternativ tekst',
    key: 'altText',
    validate: {
      required: true,
    },
  };
};

export default editFormAltText;
