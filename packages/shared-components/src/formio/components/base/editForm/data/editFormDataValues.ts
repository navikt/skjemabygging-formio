import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import editFormValuesGrid from '../shared/editFormValuesGrid';

const editFormDataValues = (): Component => ({
  ...editFormValuesGrid({ withDescription: false }),
  key: 'data.values',
});

export default editFormDataValues;
