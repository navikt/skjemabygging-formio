import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormRequired = (): Component => {
  return {
    type: 'checkbox',
    label: 'Påkrevd',
    key: 'validate.required',
  };
};

export default editFormRequired;
