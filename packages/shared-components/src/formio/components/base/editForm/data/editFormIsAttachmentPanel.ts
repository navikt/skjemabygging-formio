import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormIsAttachmentPanel = (): Component => {
  return {
    type: 'checkbox',
    label: 'Er dette et vedleggspanel?',
    key: 'isAttachmentPanel',
    defaultValue: false,
    description:
      'Vedleggspanelet inneholder alle de relevante vedleggene for søknaden. Panelet vil være synlig ved papirinnsending og være skjult ved digital innsending. Med digital innsending vil man kunne laste opp vedleggene i send-inn løsningen.',
  };
};

export default editFormIsAttachmentPanel;
