import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormBackgroundColor = (): Component => {
  return {
    type: 'navCheckbox',
    label: 'Bakgrunnsfarge',
    key: 'backgroundColor',
    defaultValue: true,
    input: true,
  };
};

export default editFormBackgroundColor;
