import { Component } from '@navikt/skjemadigitalisering-shared-domain';

interface Props {
  key?: string;
  label?: string;
  customConditional?: string;
}

const editFormLabel = ({ key = 'label', label = 'Ledetekst', customConditional }: Props = {}): Component => {
  return {
    type: 'textfield',
    key,
    label,
    customConditional,
    validate: {
      required: true,
    },
  };
};

export default editFormLabel;
