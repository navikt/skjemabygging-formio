import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormClearOnHide = (): Component => {
  return {
    type: 'checkbox',
    label: 'Nullstill verdi når feltet skjules',
    key: 'clearOnHide',
    defaultValue: true,
    input: true,
  };
};

export default editFormClearOnHide;
