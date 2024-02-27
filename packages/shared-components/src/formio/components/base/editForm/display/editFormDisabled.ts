import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormDisabled = (): Component => {
  return {
    type: 'checkbox',
    label: 'Deaktivert',
    key: 'disabled',
  };
};

export default editFormDisabled;
