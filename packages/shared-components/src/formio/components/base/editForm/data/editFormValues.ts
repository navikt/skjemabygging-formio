import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import editFormValuesGrid from '../shared/editFormValuesGrid';

interface Options {
  withDescription?: boolean;
  minLength?: number;
}

const editFormValues = (options: Options = { withDescription: false, minLength: 1 }): Component => ({
  ...editFormValuesGrid({ withDescription: options.withDescription, minLength: options.minLength }),
  key: 'values',
});

export default editFormValues;
