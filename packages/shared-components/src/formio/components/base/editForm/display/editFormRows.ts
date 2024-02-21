import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormRows = (): Component => {
  return {
    type: 'number',
    key: 'rows',
    label: 'Antall rader',
  };
};

export default editFormRows;
