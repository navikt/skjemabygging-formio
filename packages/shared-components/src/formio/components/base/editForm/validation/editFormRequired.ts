import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormRequired = (): Component => {
  return {
    type: 'checkbox',
    label: 'Påkrevd',
    key: 'validate.required',
    input: true,
  };
};

export default editFormRequired;
