import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import editFormAceEditor from '../shared/editFormAceEditor';

const editFormContent = (): Component => {
  return {
    ...editFormAceEditor('html'),
    key: 'content',
    label: 'Content',
  };
};

export default editFormContent;
