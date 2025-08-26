import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormIgnoreNorway = (): Component => {
  return {
    type: 'checkbox',
    label: 'Skjul Norge',
    key: 'ignoreNorway',
    defaultValue: false,
    input: true,
  };
};

export default editFormIgnoreNorway;
