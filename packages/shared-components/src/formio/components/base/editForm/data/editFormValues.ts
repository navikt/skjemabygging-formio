import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import editFormValuesGrid from '../shared/editFormValuesGrid';

interface Options {
  withDescription?: boolean;
}

const editFormValues = (options: Options = { withDescription: false }): Component => ({
  ...editFormValuesGrid({ withDescription: options.withDescription }),
  key: 'values',
});

export default editFormValues;
