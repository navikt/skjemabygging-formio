import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormBackgroundColor = (): Component => {
  return {
    type: 'checkbox',
    label: 'Bakgrunnsfarge',
    key: 'backgroundColor',
    defaultValue: true,
  };
};

export default editFormBackgroundColor;
