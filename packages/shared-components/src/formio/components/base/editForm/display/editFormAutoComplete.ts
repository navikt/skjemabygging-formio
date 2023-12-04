import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormLabel = (): Component => {
  return {
    type: 'textfield',
    input: true,
    key: 'autocomplete',
    label: 'Autofullfør',
    description:
      'Hvis denne ikke er satt, vil autocomplete settes til <b>off</b>. Andre gyldige verdier er <b>on</b> og spesifikke verdier slik som <b>name</b> og <b>e-mail</b>. <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete" target="_blank">Fullstendig liste over gyldige verdier.</a>',
  };
};

export default editFormLabel;
