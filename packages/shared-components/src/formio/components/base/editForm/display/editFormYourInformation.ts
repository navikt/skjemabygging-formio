import { Component } from '@navikt/skjemadigitalisering-shared-domain';

const editFormYourInformation = (): Component => {
  return {
    type: 'alertstripe',
    alerttype: 'info',
    key: 'yourInformation',
    label: '',
    customConditional: 'show = row.yourInformation',
    content:
      'Innholdet i denne beholderen brukes som avsender på førstesiden. ' +
      'Det er viktig at man ikke endre på API nøkler på komponenter i denne beholderen, ' +
      'siden de er påkrevd for å sette korrekt avsender. ' +
      'Hvis det er flere beholdere i skjemaet med denne verdien satt, ' +
      'vil man bruke den første man finner med utfylt data, ' +
      'så det anbefales og ikke ha mer enn en synlig beholder med denne verdien i hvert skjema',
  };
};

export default editFormYourInformation;
