import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editShowYearPicker = (): Component => ({
  type: 'checkbox',
  input: true,
  key: 'visArvelger',
  defaultValue: true,
  label: 'Vis årvelger i kalender',
});

export default editShowYearPicker;
