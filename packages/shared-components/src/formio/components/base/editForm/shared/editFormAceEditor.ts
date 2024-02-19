import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormAceEditor = (type: 'html' | 'javascript' | 'json'): Component => {
  return {
    type: 'formioTextArea',
    key: 'aceEditor',
    label: '',
    rows: 5,
    editor: 'ace',
    wysiwyg: {
      minLines: 5,
      mode: `ace/mode/${type}`,
      wrap: true,
      indentedSoftWrap: false,
    },
    as: type,
    input: true,
  };
};

export default editFormAceEditor;
