import { Component } from '@navikt/skjemadigitalisering-shared-domain';

export const component: Component = {
  id: 'emsdle',
  key: 'fakturaFraUtdanningsinstitusjon',
  type: 'attachment',
  input: true,
  label: 'Faktura fra utdanningsinstitusjon',
  navId: 'ex4ezti',
  values: [
    {
      label: 'Jeg legger det ved denne søknaden (anbefalt)',
      value: 'leggerVedNaa',
    },
    {
      label:
        'Jeg ettersender dokumentasjonen senere (jeg er klar over at NAV ikke kan behandle søknaden før jeg har levert dokumentasjonen)',
      value: 'ettersender',
    },
    {
      label: 'Jeg har levert denne dokumentasjonen tidligere',
      value: 'levertTidligere',
    },
  ],
  properties: {
    vedleggskode: 'Q7',
    vedleggstittel: 'Dokumentasjon av utgifter i forbindelse med utdanning',
  },
  description: '',
};
