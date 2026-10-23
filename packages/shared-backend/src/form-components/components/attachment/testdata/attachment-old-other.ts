import { Component } from '@navikt/skjemadigitalisering-shared-domain';

export const component: Component = {
  id: 'ed5xcog',
  key: 'annenDokumentasjon',
  type: 'attachment',
  input: true,
  label: 'Annen dokumentasjon',
  navId: 'ei467hn',
  values: [
    {
      label: 'Ja, jeg legger det ved denne søknaden.',
      value: 'leggerVedNaa',
    },
    {
      label: 'Jeg ettersender dokumentasjonen senere',
      value: 'ettersender',
    },
    {
      label: 'Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved.',
      value: 'neiJegHarIngenEkstraDokumentasjonJegVilLeggeVed',
    },
  ],
  properties: {
    vedleggskode: 'N6',
    vedleggstittel: 'Annet',
  },
  description: 'Har du noen annen dokumentasjon du ønsker å legge ved?',
  isAttachmentPanel: false,
  otherDocumentation: true,
};
