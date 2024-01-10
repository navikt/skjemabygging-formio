import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormAddAnother = (): Component => {
  return {
    type: 'textfield',
    label: 'Ledetekst, legg til knapp',
    key: 'addAnother',
    input: true,
  };
};

export default editFormAddAnother;
