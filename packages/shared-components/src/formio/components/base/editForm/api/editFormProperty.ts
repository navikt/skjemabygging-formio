import { Component } from '@navikt/skjemadigitalisering-shared-domain';

interface PropertyOptions {
  label: string;
  key: string;
  required: boolean;
  description?: string;
  readOnly?: boolean;
}

const editFormProperty = (options: PropertyOptions): Component => {
  return {
    type: 'textfield',
    key: `properties.${options.key}`,
    description: options.description,
    label: options.label,
    validate: {
      required: options.required,
    },
    input: true,
    readOnly: options.readOnly ?? false,
  };
};

export default editFormProperty;
