import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormShowInPdf = (): Component => {
  return {
    type: 'navCheckbox',
    label: 'Inkludér bilde i pdf',
    key: 'showInPdf',
    customDefaultValue: 'value=true',
    input: true,
  };
};

export default editFormShowInPdf;
