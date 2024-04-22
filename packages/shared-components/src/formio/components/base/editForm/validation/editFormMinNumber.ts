import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormMinNumber = (): Component => {
  return {
    type: 'number',
    label: 'Minimum',
    key: 'validate.min',
  };
};

export default editFormMinNumber;
