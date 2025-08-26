import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormSpellCheck = (): Component => {
  return {
    type: 'checkbox',
    key: 'spellcheck',
    defaultValue: true,
    label: 'Tillat stavekontroll',
    input: true,
  };
};

export default editFormSpellCheck;
