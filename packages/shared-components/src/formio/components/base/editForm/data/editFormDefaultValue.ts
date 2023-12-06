import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const defaultValue = (): Component => {
  return {
    type: 'textfield',
    label: 'Standard verdi',
    key: 'defaultValue',
    input: true,
  };
};

export default defaultValue;
