import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormQueryParams = (): Component => {
  return {
    type: 'datamap',
    label: 'API-parametre',
    keyLabel: 'Parameter',
    key: 'queryParams',
    addAnother: 'Legg til',
    valueComponent: {
      type: 'textfield',
      key: 'value',
      label: 'Verdi',
    },
  };
};
export default editFormQueryParams;
