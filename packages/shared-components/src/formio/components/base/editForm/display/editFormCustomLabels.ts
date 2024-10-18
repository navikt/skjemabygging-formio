import { Component } from '@navikt/skjemadigitalisering-shared-domain';

interface Options {
  label: string;
  key: string;
  value?: string;
  customConditional?: string;
}

const editFormCustomLabels = (options: Options): Component => {
  return {
    type: 'textfield',
    key: `customLabels.${options.key}`,
    label: options.label,
    defaultValue: options.value,
    validate: {
      required: true,
    },
    customConditional: options.customConditional,
    clearOnHide: true,
  };
};

export default editFormCustomLabels;
