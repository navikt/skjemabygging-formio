import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormIsAttachmentPanel = (): Component => {
  return {
    type: 'navCheckbox',
    label: 'Vedleggspanel',
    key: 'isAttachmentPanel',
    defaultValue: false,
    additionalDescriptionLabel: 'Hva innebærer dette?',
    additionalDescriptionText:
      'Alle vedlegg i søknaden skal legges inn på vedleggspanelet. Panelet vil være synlig ved papirinnsending og være skjult ved digital innsending. Ved digital innsending vil man få opp tilsvarende valg og kunne laste opp vedleggene på opplastningssiden etter utfylt søknad.',
  };
};

export default editFormIsAttachmentPanel;
