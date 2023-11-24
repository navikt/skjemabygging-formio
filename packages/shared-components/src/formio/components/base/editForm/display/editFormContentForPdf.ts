import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormDisabled = (): Component => {
  return {
    label: 'Innhold som skal vises i pdf',
    type: 'textfield',
    key: 'contentForPdf',
    input: true,
    validate: {
      required: false,
    },
  };
};

export default editFormDisabled;
