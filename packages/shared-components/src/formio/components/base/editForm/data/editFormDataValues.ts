import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import editFormValuesGrid from '../shared/editFormValuesGrid';

const editFormDataValues = (): Component => ({
  ...editFormValuesGrid(),
  key: 'data.values',
});

export default editFormDataValues;
