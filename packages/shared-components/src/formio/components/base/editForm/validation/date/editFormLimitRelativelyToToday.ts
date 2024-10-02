import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormLimitRelativelyToToday = (type: 'day' | 'year'): Component => {
  const pluralType = type === 'day' ? 'dager' : 'år';
  const example =
    type == 'day'
      ? 'hvis tidligst tillatt er satt til -5, vil datoer før 10. august 2022 gi feilmelding når skjemaet fylles ut 15. august 2022'
      : 'hvis tidligst tillatt er satt til -5, vil år før 2020 gi feilmelding når skjemaet fylles ut i 2025';
  return {
    type: 'panel',
    title: 'Begrens periode relativt til dagens dato',
    key: 'limitRelativelyToToday',
    label: '',
    components: [
      {
        type: 'number',
        inputType: 'numeric',
        label: `Tidligst tillatt dato (antall ${pluralType} fram/bak i tid)`,
        key: 'earliestAllowedDate',
      },
      {
        type: 'number',
        inputType: 'numeric',
        label: `Senest tillatt dato (antall ${pluralType} fram/bak i tid)`,
        key: 'latestAllowedDate',
      },
      {
        label: '',
        type: 'alertstripe',
        key: 'begrensTillattDatoInfo',
        content: `<div><p>Oppgi antall ${pluralType} for å sette tidligste og seneste tillatte dato. Begrensningen er relativ til datoen skjemaet fylles ut. Bruk positive tall for å oppgi ${pluralType} fram i tid, negative tall for å sette tillatt dato bakover i tid, og 0 for å sette dagens dato som tidligst/senest tillatt.</p><p>Eksempel: ${example}</p></div>`,
        alerttype: 'info',
      },
    ],
  };
};

export default editFormLimitRelativelyToToday;
