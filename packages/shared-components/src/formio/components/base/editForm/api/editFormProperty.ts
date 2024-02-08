import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormProperty = (label: string, key: string, required: boolean): Component => {
  return {
    type: 'textfield',
    key: `properties.${key}`,
    label,
    validate: {
      required,
    },
    input: true,
  };
};

export default editFormProperty;
