import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormInline = (): Component => {
  return {
    label: 'Inline',
    type: 'navCheckbox',
    key: 'isInline',
  };
};

export default editFormInline;
