import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormWysiwygEditor = (heading: boolean = true): Component => {
  const toolbar: string[] = [];
  if (heading) {
    toolbar.push('heading', '|');
  }

  toolbar.push('bold', 'link', 'bulletedList', 'numberedList');

  return {
    type: 'formioTextArea',
    key: 'wysiwygEditor',
    label: '',
    rows: 5,
    editor: 'ckeditor',
    wysiwyg: {
      toolbar,
    },
  };
};

export default editFormWysiwygEditor;
