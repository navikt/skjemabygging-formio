import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormDisabled = (): Component => {
  return {
    label: 'Innhold som skal vises i pdf',
    type: 'textfield',
    key: 'contentForPdf',
    input: true,
  };
};

export default editFormDisabled;
