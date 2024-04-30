import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormMaxNumber = (): Component => {
  return {
    type: 'number',
    label: 'Maksimum',
    key: 'validate.max',
  };
};

export default editFormMaxNumber;
