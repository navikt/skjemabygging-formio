import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormTextDisplay = (): Component => ({
  type: 'radiopanel',
  input: true,
  key: 'textDisplay',
  defaultValue: 'form',
  label: 'Hvor skal innholdet vises',
  description:
    '<b>Skjema</b> betyr at den vises i skjemaet man ser når man fyller ut i nettleseren. <b>PDF</b> betyr at den vises i PDF og på oppsummeringssiden.',
  dataSrc: 'values',
  values: [
    { label: 'Skjema', value: 'form' },
    { label: 'Skjema og PDF', value: 'formPdf' },
    { label: 'PDF', value: 'pdf' },
  ],
  validate: {
    required: true,
  },
});

export default editFormTextDisplay;
