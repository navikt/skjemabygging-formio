import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormRowTitle = (): Component => {
  return {
    type: 'textfield',
    label: 'Ledetekst per rad',
    key: 'rowTitle',
  };
};

export default editFormRowTitle;
