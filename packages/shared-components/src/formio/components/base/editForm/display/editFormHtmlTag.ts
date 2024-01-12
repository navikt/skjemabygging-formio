import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormHtmlTag = (): Component => {
  return {
    type: 'textfield',
    input: true,
    key: 'tag',
    label: 'HTML Tag',
  };
};

export default editFormHtmlTag;
