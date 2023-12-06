import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormSpellCheck = (): Component => {
  return {
    type: 'checkbox',
    input: true,
    key: 'spellcheck',
    defaultValue: true,
    label: 'Tillat stavekontroll',
  };
};

export default editFormSpellCheck;
