import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormKey = (): Component => {
  return {
    type: 'textfield',
    key: 'key',
    label: 'Nøkkel',
    validate: {
      pattern: '(\\w|\\w[\\w-.]*\\w)',
      patternMessage:
        'Verdien må inneholde vanlige bokstaver, understreker, punktum og bindestrek og skal ikke avsluttes med punktum eller bindestrek.',
      required: true,
    },
  };
};

export default editFormKey;
