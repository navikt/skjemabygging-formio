import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editShowYearPicker = (): Component => ({
  type: 'checkbox',
  key: 'visArvelger',
  defaultValue: true,
  label: 'Vis årvelger i kalender',
  input: true,
});

export default editShowYearPicker;
