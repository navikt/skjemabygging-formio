import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormTextDisplay = (): Component => ({
  type: 'radiopanel',
  input: true,
  key: 'textDisplay',
  label: 'Hvor skal innholdet vises',
  dataSrc: 'values',
  defaultValue: 'web',
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
