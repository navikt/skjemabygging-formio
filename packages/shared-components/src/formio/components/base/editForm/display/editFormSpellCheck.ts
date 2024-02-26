import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormSpellCheck = (): Component => {
  return {
    type: 'checkbox',
    key: 'spellcheck',
    defaultValue: true,
    label: 'Tillat stavekontroll',
  };
};

export default editFormSpellCheck;
