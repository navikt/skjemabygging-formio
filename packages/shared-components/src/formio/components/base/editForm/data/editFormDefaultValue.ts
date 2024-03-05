import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const defaultValue = (type: string): Component => {
  return {
    type,
    label: 'Standard verdi',
    key: 'defaultValue',
  };
};

export default defaultValue;
