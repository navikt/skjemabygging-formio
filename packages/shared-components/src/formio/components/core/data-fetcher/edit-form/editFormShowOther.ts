import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormShowOther = (): Component => {
  return {
    type: 'checkbox',
    label: 'Legg til annet',
    key: 'showOther',
    input: true,
    defaultValue: false,
  };
};

export default editFormShowOther;
