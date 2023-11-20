import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormMaxLength = (): Component => {
  return {
    type: 'number',
    label: 'Maksimumslengde',
    key: 'validate.maxLength',
    input: true,
    fieldSize: 'input--xxl',
  };
};

export default editFormMaxLength;
