import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import editFormAceEditor from '../shared/editFormAceEditor';

const editFormDescription = (): Component => {
  return {
    ...editFormAceEditor('html'),
    key: 'description',
    label: 'Beskrivelse',
    validate: {
      required: false,
    },
  };
};

export default editFormDescription;
