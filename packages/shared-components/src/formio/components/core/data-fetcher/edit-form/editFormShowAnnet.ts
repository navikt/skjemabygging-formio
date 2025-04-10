import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormShowAnnet = (): Component => {
  return {
    type: 'checkbox',
    label: 'Legg til annet',
    key: 'showAnnet',
    defaultValue: false,
  };
};

export default editFormShowAnnet;
