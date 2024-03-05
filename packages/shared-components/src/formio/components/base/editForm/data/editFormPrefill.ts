import { Component, PrefillType } from '@navikt/skjemadigitalisering-shared-domain';

const editFormPrefill = (): Component => {
  return {
    type: 'select',
    label: 'Preutfylling',
    key: 'prefill',
    dataSrc: 'values',
    data: {
      values: Object.keys(PrefillType).map((key) => ({ value: key, label: PrefillType[key] })),
    },
  };
};

export default editFormPrefill;
