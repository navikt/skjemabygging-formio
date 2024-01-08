import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import editFormValuesGrid from '../shared/editFormValuesGrid';

const editFormValues = (): Component => ({
  ...editFormValuesGrid(),
  key: 'values',
});

export default editFormValues;
