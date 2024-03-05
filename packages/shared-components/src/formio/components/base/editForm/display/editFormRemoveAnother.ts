import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormRemoveAnother = (): Component => {
  return {
    type: 'textfield',
    label: 'Ledetekst på fjern knapp',
    key: 'removeAnother',
  };
};

export default editFormRemoveAnother;
