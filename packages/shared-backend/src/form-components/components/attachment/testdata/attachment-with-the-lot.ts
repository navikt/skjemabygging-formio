import { Component } from '@navikt/skjemadigitalisering-shared-domain';

export const component: Component = {
  id: 'jdjkele',
  navId: 'jdjkele',
  key: 'uttalelseFraLege',
  type: 'attachment',
  input: true,
  label: 'Uttalelse fra lege',
  properties: {
    vedleggskode: 'L2',
    vedleggstittel: 'Legens uttalelse',
  },
  description: '<p>Beskrivelse til vedlegget</p>',
  attachmentType: 'default',
  attachmentValues: {
    nav: {
      enabled: true,
    },
    andre: {
      enabled: true,
    },
    harIkke: {
      enabled: true,
      additionalDocumentation: {
        label: 'Hvorfor er ikke dette vedlegget tilgjengelig?',
        enabled: true,
        description: 'Beskrivelse av hvorfor vedlegget ikke er tilgjengelig',
      },
    },
    ettersender: {
      enabled: true,
      showDeadline: true,
    },
    leggerVedNaa: {
      enabled: true,
    },
    levertTidligere: {
      enabled: true,
      additionalDocumentation: {
        label: 'Når ble dette vedlegget levert?',
        enabled: true,
        description: 'Beskrivelse av når det ble levert',
      },
    },
  },
  customConditional: '',
  additionalDescriptionText: '<p>En utvidet beskrivelse til vedlegget</p>',
  additionalDescriptionLabel: 'Her finner du en utvidet beskrivelse',
};
