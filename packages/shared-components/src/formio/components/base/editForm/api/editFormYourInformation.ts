import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormYourInformation = (): Component => {
  return {
    type: 'navCheckbox',
    key: 'isYourInformation',
    readOnly: true,
    label: 'Brukes som avsender på førsteside',
    customConditional: 'show = row.isYourInformation',
    additionalDescriptionLabel: 'Hva innebærer dette?',
    additionalDescriptionText:
      'Innholdet i denne beholderen brukes som avsender på førstesiden. ' +
      'Det er viktig at man ikke endre på API nøkler i denne beholderen, siden de er påkrevd for å sette korrekt avsender. ' +
      'Hvis det er flere beholdere i skjemaet med denne verdien satt, vil man bruke den første man finner med utfylt data, ' +
      'så det anbefales og ikke ha mer enn en synlig beholder med denne verdien i hvert skjema',
  };
};

export default editFormYourInformation;
