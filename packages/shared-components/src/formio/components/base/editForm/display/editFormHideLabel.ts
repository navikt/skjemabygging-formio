import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormHideLabel = (): Component => {
  return {
    type: 'checkbox',
    label: 'Skjul ledetekst',
    key: 'hideLabel',
    input: true,
  };
};

export default editFormHideLabel;
