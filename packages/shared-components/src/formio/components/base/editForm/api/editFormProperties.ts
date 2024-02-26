import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormProperties = (): Component => {
  return {
    type: 'datamap',
    label: 'Andre egenskaper',
    keyLabel: 'Nøkkel',
    key: 'properties',
    addAnother: 'Legg til',
    valueComponent: {
      type: 'textfield',
      key: 'value',
      label: 'Verdi',
    },
  };
};

export default editFormProperties;
