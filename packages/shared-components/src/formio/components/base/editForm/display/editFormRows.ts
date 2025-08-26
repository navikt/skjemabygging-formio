import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormRows = (): Component => {
  return {
    type: 'number',
    key: 'rows',
    label: 'Antall rader',
    input: true,
  };
};

export default editFormRows;
