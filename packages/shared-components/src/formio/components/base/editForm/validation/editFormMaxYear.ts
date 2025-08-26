import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormMaxYear = (): Component => {
  return {
    type: 'year',
    label: 'Maksimum år',
    key: 'validate.maxYear',
    input: true,
  };
};

export default editFormMaxYear;
