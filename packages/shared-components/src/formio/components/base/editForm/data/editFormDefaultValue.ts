import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormDefaultValue = (type: string): Component => {
  return {
    type,
    label: 'Standard verdi',
    key: 'defaultValue',
  };
};

export default editFormDefaultValue;
