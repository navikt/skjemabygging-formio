import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormLegend = (): Component => {
  return {
    type: 'textfield',
    key: 'legend',
    label: 'Ledetekst',
    input: true,
    validate: {
      required: true,
    },
  };
};

export default editFormLegend;
