import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import editFormWysiwygEditor from '../shared/editFormWysiwygEditor';

interface PropertyOptions {
  customConditional?: string;
}

const editFormAdditionalDescription = (options?: PropertyOptions): Component => {
  return {
    type: 'panel',
    title: 'Utvidet beskrivelse (valgfri)',
    key: 'additionalDescription',
    label: '',
    input: false,
    components: [
      {
        ...editFormWysiwygEditor(false),
        key: 'additionalDescriptionText',
        input: true,
        hideLabel: true,
        validate: {
          required: false,
          custom:
            'valid = (!input && data.additionalDescriptionLabel) ? "Utvidet beskrivelse er påkrevd, når man har lenketekst": true;',
          maxLength: 4000,
        },
      },
      {
        type: 'textfield',
        key: 'additionalDescriptionLabel',
        input: true,
        label: 'Lenketekst for utvidet beskrivelse',
        validate: {
          required: false,
          custom:
            'valid = (!input && data.additionalDescriptionText) ? "Lenketekst er påkrevd, når man har utvidet beskrivelse" : true;',
        },
      },
    ],
    customConditional: options?.customConditional,
  };
};

export default editFormAdditionalDescription;
