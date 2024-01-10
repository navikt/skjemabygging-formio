import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormAlertType = (): Component => {
  return {
    label: 'Type',
    type: 'radiopanel',
    key: 'alerttype',
    input: true,
    values: [
      {
        value: 'info',
        label: 'Info',
      },
      {
        value: 'success',
        label: 'Suksess',
      },
      {
        value: 'warning',
        label: 'Advarsel',
      },
      {
        value: 'error',
        label: 'Feil',
      },
    ],
  };
};

export default editFormAlertType;
