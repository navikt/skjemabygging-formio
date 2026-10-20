import { Component } from '@navikt/skjemadigitalisering-shared-domain';

export const component: Component = {
  id: 'evfo5qs',
  navId: 'en5h1c',
  key: 'annenDokumentasjon',
  type: 'attachment',
  input: true,
  label: 'Annen dokumentasjon',
  dataSrc: 'values',
  properties: {
    vedleggskode: 'N6',
    vedleggstittel: 'Annet',
  },
  description: 'Har du noen annen dokumentasjon du ønsker å legge ved?',
  attachmentType: 'other',
  attachmentValues: {
    nei: {
      enabled: true,
    },
    leggerVedNaa: {
      enabled: true,
    },
  },
};
