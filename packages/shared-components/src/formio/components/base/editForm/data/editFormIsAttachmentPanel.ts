import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormIsAttachmentPanel = (): Component => {
  return {
    type: 'navCheckbox',
    label: 'Vedleggspanel',
    key: 'isAttachmentPanel',
    defaultValue: false,
    additionalDescriptionLabel: 'Hva innebærer dette?',
    additionalDescriptionText:
      'Vedleggspanelet inneholder alle de relevante vedleggene for søknaden. Panelet vil være synlig ved papirinnsending og være skjult ved digital innsending. Med digital innsending vil man kunne laste opp vedleggene på opplastningssiden etter utfylt søknad.',
  };
};

export default editFormIsAttachmentPanel;
