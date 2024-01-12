import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormProperties = (): Component => {
  return {
    type: 'datamap',
    label: 'Custom Properties',
    keyLabel: 'Nøkkel',
    key: 'properties',
    addAnother: 'Legg til',
    valueComponent: {
      type: 'textfield',
      key: 'value',
      label: 'Verdi',
      input: true,
    },
  };
};

export default editFormProperties;
