import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormReadOnly = (): Component => {
  return {
    type: 'checkbox',
    label: 'Skrivebeskyttet',
    key: 'readOnly',
    defaultValue: false,
  };
};

export default editFormReadOnly;
