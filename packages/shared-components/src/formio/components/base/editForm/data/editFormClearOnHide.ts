import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormClearOnHide = (): Component => {
  return {
    type: 'checkbox',
    label: 'Nullstill verdi når feltet skjules',
    key: 'clearOnHide',
    input: true,
    defaultValue: true,
  };
};

export default editFormClearOnHide;
