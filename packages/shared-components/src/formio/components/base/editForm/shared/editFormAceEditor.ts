import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormAceEditor = (type: 'html' | 'javascript' | 'json'): Component => {
  return {
    type: 'textarea',
    rows: 5,
    editor: 'ace',
    wysiwyg: {
      minLines: 5,
      mode: `ace/mode/${type}`,
    },
    as: type,
    input: true,
  };
};

export default editFormAceEditor;
