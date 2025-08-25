import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormShowAreaCode = (): Component => {
  return {
    type: 'checkbox',
    label: 'Vis landskode',
    key: 'showAreaCode',
    defaultValue: false,
  };
};

export default editFormShowAreaCode;
