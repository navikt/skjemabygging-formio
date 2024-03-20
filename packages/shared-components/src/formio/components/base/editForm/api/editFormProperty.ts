import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormProperty = (label: string, key: string, required: boolean, description?: string): Component => {
  return {
    type: 'textfield',
    key: `properties.${key}`,
    description,
    label,
    validate: {
      required,
    },
    input: true,
  };
};

export default editFormProperty;
