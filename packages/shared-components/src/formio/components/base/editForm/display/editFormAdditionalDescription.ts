import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import editFormAceEditor from '../shared/editFormAceEditor';

const editFormAdditionalDescription = (): Component => {
  return {
    type: 'panel',
    title: 'Utvidet beskrivelse (valgfri)',
    key: 'additionalDescription',
    label: '',
    components: [
      {
        ...editFormAceEditor('html'),
        key: 'additionalDescriptionText',
        hideLabel: true,
        validate: {
          required: false,
          custom:
            'valid = (!input && data.additionalDescriptionLabel) ? "Utvidet beskrivelse er påkrevd, når man har lenketekst": true;',
        },
      },
      {
        type: 'textfield',
        key: 'additionalDescriptionLabel',
        label: 'Lenketekst for utvidet beskrivelse',
        validate: {
          required: false,
          custom:
            'valid = (!input && data.additionalDescriptionText) ? "Lenketekst er påkrevd, når man har utvidet beskrivelse" : true;',
        },
        input: true,
      },
    ],
  };
};

export default editFormAdditionalDescription;