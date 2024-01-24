import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import editFormWysiwygEditor from '../shared/editFormWysiwygEditor';

const editFormDescription = (): Component => {
  return {
    ...editFormWysiwygEditor(false),
    key: 'description',
    label: 'Beskrivelse',
  };
};

export default editFormDescription;
