import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormLegend = (): Component => {
  return {
    type: 'textfield',
    key: 'legend',
    label: 'Ledetekst',
    validate: {
      required: true,
    },
    input: true,
  };
};

export default editFormLegend;
