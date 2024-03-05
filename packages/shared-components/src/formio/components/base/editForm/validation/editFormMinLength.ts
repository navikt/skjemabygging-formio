import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormMinLength = (): Component => {
  return {
    type: 'number',
    label: 'Minimumslengde',
    key: 'validate.minLength',
  };
};

export default editFormMinLength;
