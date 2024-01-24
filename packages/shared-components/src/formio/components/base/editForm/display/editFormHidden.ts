import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormHidden = (calculateValue: string): Component => {
  return {
    type: 'hidden',
    label: 'Skjul',
    key: 'hidden',
    defaultValue: true,
    calculateValue,
  };
};

export default editFormHidden;
