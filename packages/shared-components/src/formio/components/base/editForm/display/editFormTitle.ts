import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormTitle = (): Component => {
  return {
    type: 'textfield',
    key: 'title',
    label: 'Tittel',
    validate: {
      required: true,
    },
  };
};

export default editFormTitle;
