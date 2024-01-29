import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormContentForPdf = (): Component => {
  return {
    label: 'Innhold som skal vises i pdf',
    description:
      'Denne skal ikke lengre brukes og innholdet bør fjernes. Bruk funksjonaliteten om hvor innhold skal vises istedenfor',
    type: 'textfield',
    key: 'contentForPdf',
    input: true,
  };
};

export default editFormContentForPdf;
