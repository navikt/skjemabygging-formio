import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormInline = (): Component => {
  return {
    label: 'Inline',
    type: 'navCheckbox',
    key: 'isInline',
    input: true,
  };
};

export default editFormInline;
