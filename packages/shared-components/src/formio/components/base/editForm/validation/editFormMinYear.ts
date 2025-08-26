import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormMinYear = (): Component => {
  return {
    type: 'year',
    label: 'Minimum år',
    key: 'validate.minYear',
    input: true,
  };
};

export default editFormMinYear;
