import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormMaxLength = (): Component => {
  return {
    type: 'number',
    label: 'Maksimumslengde',
    key: 'validate.maxLength',
  };
};

export default editFormMaxLength;
