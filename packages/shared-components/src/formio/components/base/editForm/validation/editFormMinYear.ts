import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormMinYear = (): Component => {
  return {
    type: 'number',
    label: 'Minimum år',
    key: 'validate.minYear',
    validate: {
      min: 1900,
      max: 2100,
    },
  };
};

export default editFormMinYear;
