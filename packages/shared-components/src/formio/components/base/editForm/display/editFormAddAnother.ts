import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormAddAnother = (): Component => {
  return {
    type: 'textfield',
    label: 'Ledetekst på legg til knapp',
    key: 'addAnother',
  };
};

export default editFormAddAnother;
