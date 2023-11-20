import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormClearOnHide = (): Component => {
  return {
    type: 'checkbox',
    label: 'Nullstill verdi ved skjuling',
    key: 'clearOnHide',
    defaultValue: true,
    input: true,
  };
};

export default editFormClearOnHide;
