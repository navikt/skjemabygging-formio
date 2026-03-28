/*
 * Production form tests for Tilleggsstønad - støtte til reise for å komme i arbeid
 * Form: nav111222b
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Dine opplysninger (personopplysninger): 3 same-panel customConditionals
 *       identitet.harDuFodselsnummer → adresse visibility
 *       identitet.harDuFodselsnummer === "ja" → folkeregister alert
 *       adresse.borDuINorge → adresseVarighet visibility
 *   - Reiseavstand (reiseavstand): 1 same-panel customConditional
 *       velgLandArbeidssoker → Postnummer / Postkode visibility
 *   - Reisemåte (reiseNarDuErArbeidssoker): 9 same-panel conditionals
 *       hvorforReiserDuArbeidssoker → attachment alert
 *       dekkerAndreEnnNavEllerDegSelvReisenHeltEllerDelvis → expense attachment alert
 *       mottarDuEllerHarDuMotattDagpengerILopetAvDeSisteSeksManedene → dagpenger follow-ups
 *       kanDuReiseKollektivtArbeidssoker → kollektiv / ikke-kollektiv branches
 *       hvaErHovedarsakenTilAtDuIkkeKanReiseKollektivt → reason-specific fields and alerts
 *       kanDuBenytteEgenBil + expenses / can use taxi → own-car alert + no-car follow-ups
 *   - Vedlegg (vedlegg, isAttachmentPanel=true): 8 cross-panel conditional attachments
 *       hvorforReiserDuArbeidssoker / dekkerAndre... → reason + expense attachments
 *       hovedårsak → medical / SFO / other-reason attachment
 *       own-car extra costs → egen bil attachment
 *       no-car reason / taxi → no-car + taxi attachments
 *
 * Note: Din situasjon contains a prefill-driven customConditional on regArbSoker.
 * The summary flow handles that panel opportunistically instead of forcing a brittle assertion.
 */

const setupForm = () => {
  cy.defaultIntercepts();
  cy.defaultInterceptsExternal();
};

const selectHasNorwegianIdentityNumber = (answer: 'Ja' | 'Nei') => {
  cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
    cy.findByRole('radio', { name: answer }).click();
  });
};

const selectWhyTravel = (
  answer:
    | 'Jeg reiser på grunn av oppfølging fra NAV'
    | 'Jeg reiser på grunn av jobbintervju'
    | 'Jeg reiser fordi jeg begynner i arbeid på nytt sted',
) => {
  cy.withinComponent('Hvorfor reiser du?', () => {
    cy.findByRole('radio', { name: answer }).click();
  });
};

const selectCanTravelCollectively = (answer: 'Ja' | 'Nei') => {
  cy.withinComponent('Kan du reise kollektivt?', () => {
    cy.findByRole('radio', { name: answer }).click();
  });
};

const selectMainReasonNotCollective = (
  answer:
    | 'Helsemessige årsaker'
    | 'Dårlig transporttilbud'
    | 'Henting eller levering av barn i barnehage eller skolefritidsordning (SFO)'
    | 'Annet',
) => {
  cy.withinComponent('Hva er hovedårsaken til at du ikke kan reise kollektivt?', () => {
    cy.findByRole('radio', { name: answer }).click();
  });
};

const selectCanUseOwnCar = (answer: 'Ja' | 'Nei') => {
  cy.withinComponent('Kan du benytte egen bil?', () => {
    cy.findByRole('radio', { name: answer }).click();
  });
};

const selectCannotUseOwnCarReason = (answer: 'Helsemessige årsaker' | 'Disponerer ikke bil' | 'Annet') => {
  cy.withinComponent('Hva er årsaken til at du ikke kan benytte egen bil?', () => {
    cy.findByRole('radio', { name: answer }).click();
  });
};

const selectCanUseTaxi = (answer: 'Ja' | 'Nei') => {
  cy.withinComponent('Kan du benytte drosje?', () => {
    cy.findByRole('radio', { name: answer }).click();
  });
};

const advancePastStartPanels = () => {
  cy.get('h2#page-title').then(($heading) => {
    const title = $heading.text().trim();

    if (title === 'Introduksjon' || title === 'Veiledning') {
      cy.clickNextStep();
      advancePastStartPanels();
    }
  });
};

describe('nav111222b', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    setupForm();
  });

  describe('Dine opplysninger – identity conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111222b/personopplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('toggles address fields and folkeregister alert when identity number answer changes', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.contains('Nav sender svar på søknad og annen kommunikasjon til din folkeregistrerte adresse.').should(
        'not.exist',
      );

      selectHasNorwegianIdentityNumber('Nei');
      cy.findByLabelText('Bor du i Norge?').should('exist');

      selectHasNorwegianIdentityNumber('Ja');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.contains('Nav sender svar på søknad og annen kommunikasjon til din folkeregistrerte adresse.').should('exist');
    });

    it('shows address validity fields when the applicant lives outside Norway', () => {
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('not.exist');

      selectHasNorwegianIdentityNumber('Nei');
      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('exist');

      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('not.exist');
    });
  });

  describe('Reiseavstand – country dependent address conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111222b/reiseavstand?sub=paper');
      cy.defaultWaits();
    });

    it('switches between Norwegian postnummer and foreign postkode', () => {
      cy.findByRole('textbox', { name: /Postkode/ }).should('not.exist');
      cy.findByLabelText('Postnummer').should('exist');

      cy.findByRole('combobox', { name: 'Velg land' }).type('Sver{downarrow}{enter}');
      cy.findByRole('textbox', { name: /Postkode/ }).should('exist');
      cy.findByLabelText('Postnummer').should('not.exist');

      cy.findByRole('combobox', { name: 'Velg land' }).type('{selectall}{backspace}Norg{downarrow}{enter}');
      cy.findByLabelText('Postnummer').should('exist');
      cy.findByRole('textbox', { name: /Postkode/ }).should('not.exist');
    });
  });

  describe('Reisemåte conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111222b/reiseNarDuErArbeidssoker?sub=paper');
      cy.defaultWaits();
    });

    it('shows the travel-reason and expense alerts for the relevant answers', () => {
      cy.contains('Du må legge ved dokumentasjon av årsak til reise/flytting.').should('not.exist');
      cy.contains('Du må legge ved dokumentasjon av reiseutgifter.').should('not.exist');

      selectWhyTravel('Jeg reiser på grunn av jobbintervju');
      cy.contains('Du må legge ved dokumentasjon av årsak til reise/flytting.').should('exist');

      selectWhyTravel('Jeg reiser på grunn av oppfølging fra NAV');
      cy.contains('Du må legge ved dokumentasjon av årsak til reise/flytting.').should('not.exist');

      cy.withinComponent('Dekker andre enn NAV eller deg selv reisen helt eller delvis?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.contains('Du må legge ved dokumentasjon av reiseutgifter.').should('exist');

      cy.withinComponent('Dekker andre enn NAV eller deg selv reisen helt eller delvis?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.contains('Du må legge ved dokumentasjon av reiseutgifter.').should('not.exist');
    });

    it('toggles the dagpenger follow-up questions', () => {
      cy.findByLabelText('Har du hatt forlenget ventetid de siste åtte ukene?').should('not.exist');
      cy.findByLabelText('Har du hatt tidsbegrenset bortfall de siste åtte ukene?').should('not.exist');

      cy.withinComponent('Mottar du eller har du motatt dagpenger i løpet av de siste seks månedene?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Har du hatt forlenget ventetid de siste åtte ukene?').should('exist');
      cy.findByLabelText('Har du hatt tidsbegrenset bortfall de siste åtte ukene?').should('exist');

      cy.withinComponent('Mottar du eller har du motatt dagpenger i løpet av de siste seks månedene?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Har du hatt forlenget ventetid de siste åtte ukene?').should('not.exist');
      cy.findByLabelText('Har du hatt tidsbegrenset bortfall de siste åtte ukene?').should('not.exist');
    });

    it('switches between collective travel costs and the non-collective branch', () => {
      cy.findByLabelText('Hvilke utgifter har du i forbindelse med reisen?').should('not.exist');
      cy.findByLabelText('Hva er hovedårsaken til at du ikke kan reise kollektivt?').should('not.exist');

      selectCanTravelCollectively('Ja');
      cy.findByLabelText('Hvilke utgifter har du i forbindelse med reisen?').should('exist');
      cy.findByLabelText('Hva er hovedårsaken til at du ikke kan reise kollektivt?').should('not.exist');

      selectCanTravelCollectively('Nei');
      cy.findByLabelText('Hvilke utgifter har du i forbindelse med reisen?').should('not.exist');
      cy.findByLabelText('Hva er hovedårsaken til at du ikke kan reise kollektivt?').should('exist');
      cy.contains('Som hovedregel dekker vi den rimeligste reisemåten med kollektiv transport').should('exist');
    });

    it('shows the medical and poor-transport follow-ups for the main reason', () => {
      selectCanTravelCollectively('Nei');

      cy.contains('Du må legge ved legeerklæring på medisinske årsaker.').should('not.exist');
      cy.findByLabelText(
        'Beskriv de spesielle forholdene ved reiseveien som gjør at du ikke kan reise kollektivt',
      ).should('not.exist');

      selectMainReasonNotCollective('Helsemessige årsaker');
      cy.contains('Du må legge ved legeerklæring på medisinske årsaker.').should('exist');

      selectMainReasonNotCollective('Dårlig transporttilbud');
      cy.contains('Du må legge ved legeerklæring på medisinske årsaker.').should('not.exist');
      cy.findByLabelText(
        'Beskriv de spesielle forholdene ved reiseveien som gjør at du ikke kan reise kollektivt',
      ).should('exist');
    });

    it('shows the childcare and other-reason follow-ups for the main reason', () => {
      selectCanTravelCollectively('Nei');

      cy.findByRole('textbox', { name: 'Adressen hvor du henter eller leverer barn' }).should('not.exist');
      cy.findByLabelText('Hvilke andre årsaker er det som gjør at du ikke kan reise kollektivt?').should('not.exist');

      selectMainReasonNotCollective('Henting eller levering av barn i barnehage eller skolefritidsordning (SFO)');
      cy.findByRole('textbox', { name: 'Adressen hvor du henter eller leverer barn' }).should('exist');
      cy.findByLabelText('Postnummer').should('exist');
      cy.contains('Du må legge ved dokumentasjon av plass i barnehage eller SFO.').should('exist');

      selectMainReasonNotCollective('Annet');
      cy.findByRole('textbox', { name: 'Adressen hvor du henter eller leverer barn' }).should('not.exist');
      cy.findByLabelText('Hvilke andre årsaker er det som gjør at du ikke kan reise kollektivt?').should('exist');
      cy.contains('Du må legge ved dokumentasjon av andre årsaker som gjør at du ikke kan reise kollektivt.').should(
        'exist',
      );
    });

    it('toggles the own-car and no-car branches', () => {
      selectCanTravelCollectively('Nei');
      selectMainReasonNotCollective('Dårlig transporttilbud');

      cy.findByRole('textbox', { name: /Bompenger/ }).should('not.exist');
      cy.findByLabelText('Hva er årsaken til at du ikke kan benytte egen bil?').should('not.exist');

      selectCanUseOwnCar('Ja');
      cy.findByRole('textbox', { name: /Bompenger/ }).should('exist');

      selectCanUseOwnCar('Nei');
      cy.findByRole('textbox', { name: /Bompenger/ }).should('not.exist');
      cy.findByLabelText('Hva er årsaken til at du ikke kan benytte egen bil?').should('exist');
    });

    it('shows the own-car documentation alert when extra expenses are entered', () => {
      selectCanTravelCollectively('Nei');
      selectMainReasonNotCollective('Dårlig transporttilbud');
      selectCanUseOwnCar('Ja');

      cy.contains('Du må legge ved dokumentasjon på utgifter knyttet til bruk av egen bil.').should('not.exist');

      cy.findByRole('textbox', { name: /Bompenger/ }).type('250');

      cy.contains('Du må legge ved dokumentasjon på utgifter knyttet til bruk av egen bil.').should('exist');
    });

    it('shows taxi amount for the taxi branch and the rejection message when taxi cannot be used', () => {
      selectCanTravelCollectively('Nei');
      selectMainReasonNotCollective('Dårlig transporttilbud');
      selectCanUseOwnCar('Nei');
      selectCannotUseOwnCarReason('Disponerer ikke bil');

      cy.findByLabelText(
        'Hva er den totale kostnaden du har til bruk av drosje i perioden du søker om stønad for?',
      ).should('not.exist');
      cy.findByLabelText('Hvorfor kan du ikke benytte drosje?').should('not.exist');

      selectCanUseTaxi('Ja');
      cy.findByLabelText(
        'Hva er den totale kostnaden du har til bruk av drosje i perioden du søker om stønad for?',
      ).should('exist');

      selectCanUseTaxi('Nei');
      cy.findByLabelText(
        'Hva er den totale kostnaden du har til bruk av drosje i perioden du søker om stønad for?',
      ).should('not.exist');
      cy.findByLabelText('Hvorfor kan du ikke benytte drosje?').should('exist');
      cy.contains('Du vil derfor sannsynligvis få avslag på søknaden om stønad til reiser.').should('exist');
    });

    it('shows the no-car other-reason alert and textarea for the annet branch', () => {
      selectCanTravelCollectively('Nei');
      selectMainReasonNotCollective('Dårlig transporttilbud');
      selectCanUseOwnCar('Nei');

      cy.contains('Du må legge ved dokumentasjon av andre årsaker som gjør at du ikke kan benytte egen bil.').should(
        'not.exist',
      );
      cy.findByLabelText('Hvilke andre årsaker gjør at du ikke kan benytte egen bil?').should('not.exist');

      selectCannotUseOwnCarReason('Annet');

      cy.contains('Du må legge ved dokumentasjon av andre årsaker som gjør at du ikke kan benytte egen bil.').should(
        'exist',
      );
      cy.findByLabelText('Hvilke andre årsaker gjør at du ikke kan benytte egen bil?').should('exist');
    });
  });

  describe('Vedlegg – cross-panel conditional attachments', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111222b/reiseNarDuErArbeidssoker?sub=paper');
      cy.defaultWaits();
    });

    it('shows the reason and expense attachments for the relevant travel answers', () => {
      selectWhyTravel('Jeg reiser på grunn av jobbintervju');
      cy.withinComponent('Dekker andre enn NAV eller deg selv reisen helt eller delvis?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Dokumentasjon av årsak til reise\/flytting/ }).should('exist');
      cy.findByRole('group', { name: /Dokumentasjon av reiseutgifter/ }).should('exist');

      cy.findByRole('link', { name: 'Reisemåte' }).click();
      selectWhyTravel('Jeg reiser på grunn av oppfølging fra NAV');
      cy.withinComponent('Dekker andre enn NAV eller deg selv reisen helt eller delvis?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Dokumentasjon av årsak til reise\/flytting/ }).should('not.exist');
      cy.findByRole('group', { name: /Dokumentasjon av reiseutgifter/ }).should('not.exist');
    });

    it('shows the medical, childcare, and other kollektiv attachments for their respective branches', () => {
      selectCanTravelCollectively('Nei');
      selectMainReasonNotCollective('Helsemessige årsaker');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', {
        name: /Legeerklæring på medisinske årsaker til at du ikke kan reise kollektivt/,
      }).should('exist');
      cy.findByRole('group', {
        name: /Dokumentasjon av plass i barnehage eller skolefritidsordning/,
      }).should('not.exist');

      cy.findByRole('link', { name: 'Reisemåte' }).click();
      selectMainReasonNotCollective('Henting eller levering av barn i barnehage eller skolefritidsordning (SFO)');
      cy.findByRole('textbox', { name: 'Adressen hvor du henter eller leverer barn' }).type('Barnehageveien 2');
      cy.findByLabelText('Postnummer').type('0123');

      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', {
        name: /Dokumentasjon av plass i barnehage eller skolefritidsordning/,
      }).should('exist');

      cy.findByRole('link', { name: 'Reisemåte' }).click();
      selectMainReasonNotCollective('Annet');
      cy.findByLabelText('Hvilke andre årsaker er det som gjør at du ikke kan reise kollektivt?').type(
        'Jeg trenger følge hele veien.',
      );

      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Dokumentasjon av andre årsaker til at du ikke kan reise kollektivt/ }).should(
        'exist',
      );
      cy.findByRole('group', {
        name: /Legeerklæring på medisinske årsaker til at du ikke kan reise kollektivt/,
      }).should('not.exist');
    });

    it('shows the own-car expense attachment when extra costs are entered', () => {
      selectCanTravelCollectively('Nei');
      selectMainReasonNotCollective('Dårlig transporttilbud');
      cy.findByLabelText(
        'Beskriv de spesielle forholdene ved reiseveien som gjør at du ikke kan reise kollektivt',
      ).type('Det går ingen buss når jeg må reise.');
      selectCanUseOwnCar('Ja');
      cy.findByRole('textbox', { name: /Bompenger/ }).type('300');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Dokumentasjon av utgifter knyttet til bruk av egen bil/ }).should('exist');
    });

    it('shows no-car and taxi attachments for the own-car annet plus taxi branch', () => {
      selectCanTravelCollectively('Nei');
      selectMainReasonNotCollective('Dårlig transporttilbud');
      cy.findByLabelText(
        'Beskriv de spesielle forholdene ved reiseveien som gjør at du ikke kan reise kollektivt',
      ).type('Jeg må reise før kollektivtilbudet starter.');
      selectCanUseOwnCar('Nei');
      selectCannotUseOwnCarReason('Annet');
      cy.findByLabelText('Hvilke andre årsaker gjør at du ikke kan benytte egen bil?').type('Jeg har ikke førerkort.');
      selectCanUseTaxi('Ja');
      cy.findByLabelText(
        'Hva er den totale kostnaden du har til bruk av drosje i perioden du søker om stønad for?',
      ).type('1800');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Dokumentasjon av andre årsaker til at du ikke kan benytte egen bil/ }).should(
        'exist',
      );
      cy.findByRole('group', { name: /Dokumentasjon av utgifter til drosje/ }).should('exist');
      cy.findByRole('group', {
        name: /Legeerklæring på helsemessige årsaker til at du ikke kan benytte egen bil/,
      }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111222b?sub=paper');
      cy.defaultWaits();
    });

    it('fills required fields and verifies summary', () => {
      const travelDate = new Intl.DateTimeFormat('nb-NO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(new Date(new Date().setMonth(new Date().getMonth() + 1)));

      advancePastStartPanels();

      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      selectHasNorwegianIdentityNumber('Ja');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      cy.get('body').then(($body) => {
        if ($body.text().includes('Er du registrert arbeidssøker?')) {
          cy.withinComponent('Er du registrert arbeidssøker?', () => {
            cy.findByRole('radio', { name: 'Ja' }).click();
          });
        }
      });
      cy.clickNextStep();

      cy.findByLabelText('Oppgi når du skal reise eller har reist (dd.mm.åååå)').type(travelDate);
      cy.findByLabelText('Hvor lang reisevei har du?').type('25');
      cy.findByRole('textbox', { name: 'Gateadresse' }).type('Testveien 1');
      cy.findByLabelText('Postnummer').type('0123');
      cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
      cy.clickNextStep();

      selectWhyTravel('Jeg reiser på grunn av oppfølging fra NAV');
      cy.withinComponent('Dekker andre enn NAV eller deg selv reisen helt eller delvis?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Mottar du eller har du motatt dagpenger i løpet av de siste seks månedene?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      selectCanTravelCollectively('Ja');
      cy.findByLabelText('Hvilke utgifter har du i forbindelse med reisen?').type('1500');
      cy.clickNextStep();

      cy.clickNextStep();

      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved/ }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Reisemåte', () => {
        cy.get('dt').should('contain.text', 'Hvorfor reiser du?');
        cy.contains('dd', 'Jeg reiser på grunn av oppfølging fra NAV').should('exist');
        cy.contains('dd', 'Ja').should('exist');
        cy.contains('dd', /1\s*500,00\s*NOK/).should('exist');
      });
    });
  });
});
