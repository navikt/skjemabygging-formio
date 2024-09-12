import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormMinYear = (): Component => {
  return {
    type: 'year',
    label: 'Minimum år',
    key: 'validate.minYear',
  };
};

export default editFormMinYear;
