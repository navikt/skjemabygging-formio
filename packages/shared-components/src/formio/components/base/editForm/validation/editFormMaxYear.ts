import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormMaxYear = (): Component => {
  return {
    type: 'number',
    label: 'Maksimum år',
    key: 'validate.maxYear',
    validate: {
      min: 1900,
      max: 2100,
    },
  };
};

export default editFormMaxYear;
