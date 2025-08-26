import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormTitle = (): Component => {
  return {
    type: 'textfield',
    key: 'title',
    label: 'Tittel',
    input: true,
    validate: {
      required: true,
    },
  };
};

export default editFormTitle;
