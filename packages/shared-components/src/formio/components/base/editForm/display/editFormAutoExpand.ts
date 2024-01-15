import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormAutoExpand = (): Component => {
  return {
    type: 'checkbox',
    input: true,
    key: 'autoExpand',
    label: 'Utvid automatisk',
    conditional: {
      json: {
        '==': [{ var: 'data.editor' }, ''],
      },
    },
  };
};

export default editFormAutoExpand;
