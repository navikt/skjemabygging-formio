import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormHideLabel = (): Component => {
  return {
    type: 'checkbox',
    label: 'Skjul ledetekst',
    key: 'hideLabel',
  };
};

export default editFormHideLabel;
