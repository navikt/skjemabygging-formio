import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormContentForPdf = (): Component => {
  return {
    label: 'Innhold som skal vises i pdf (ikke bruk denne)',
    type: 'textfield',
    key: 'contentForPdf',
    input: true,
  };
};

export default editFormContentForPdf;
