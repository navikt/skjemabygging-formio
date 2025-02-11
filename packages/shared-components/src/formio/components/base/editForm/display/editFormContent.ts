import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import editFormWysiwygEditor from '../shared/editFormWysiwygEditor';

const editFormContent = (): Component => {
  return {
    ...editFormWysiwygEditor(),
    key: 'content',
    label: 'Innhold',
    validate: {
      required: true,
      maxLength: 4000,
    },
  };
};

export default editFormContent;
