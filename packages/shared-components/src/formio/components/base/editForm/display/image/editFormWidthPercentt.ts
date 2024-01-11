import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormWidthPercent = (): Component => {
  return {
    label: 'Størrelse i prosent',
    fieldSize: 'input--xs',
    validate: {
      required: true,
      min: 20,
      max: 100,
    },
    defaultValue: 100,
    key: 'widthPercent',
    type: 'number',
    input: true,
  };
};

export default editFormWidthPercent;
