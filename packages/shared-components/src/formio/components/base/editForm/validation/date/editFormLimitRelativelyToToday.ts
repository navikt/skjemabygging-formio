import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormLimitRelativelyToToday = (): Component => ({
  type: 'panel',
  title: 'Begrens periode relativt til dagens dato',
  key: 'limitRelativelyToToday',
  label: '',
  components: [
    {
      type: 'number',
      label: 'Tidligst tillatt dato (antall dager fram/bak i tid)',
      key: 'earliestAllowedDate',
    },
    {
      type: 'number',
      label: 'Senest tillatt dato (antall dager fram/bak i tid)',
      key: 'latestAllowedDate',
    },
    {
      label: '',
      type: 'alertstripe',
      key: 'begrensTillattDatoInfo',
      content:
        '<div><p>Oppgi antall dager for å sette tidligste og seneste tillatte dato. Begrensningen er relativ til datoen skjemaet fylles ut. Bruk positive tall for å oppgi dager fram i tid, negative tall for å sette tillatt dato bakover i tid, og 0 for å sette dagens dato som tidligst/senest tillatt.</p><p>Eksempel: hvis tidligst tillatt er satt til -5, vil datoer før 10. august 2022 gi feilmelding når skjemaet fylles ut 15. august 2022</p></div>',
      alerttype: 'info',
    },
  ],
});

export default editFormLimitRelativelyToToday;
