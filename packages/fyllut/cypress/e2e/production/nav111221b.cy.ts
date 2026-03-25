/*
 * Production form tests for Tilleggsstønad - støtte til daglig reise
 * Form: nav111221b
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Dine opplysninger (personopplysninger): 4 same-panel customConditionals
 *       identitet.harDuFodselsnummer → adresse visibility
 *       identitet.harDuFodselsnummer === "ja" → folkeregister alert
 *       adresse.borDuINorge / vegadresseEllerPostboksadresse → adresseVarighet visibility
 *   - Reiseavstand (reiseavstand): 2 same-panel conditionals
 *       harDuEnReiseveiPaSeksKilometerEllerMer → harDuAvMedisinskeArsakerBehovForTransportUavhengigAvReisensLengde
 *       harDuAvMedisinskeArsakerBehovForTransportUavhengigAvReisensLengde → alertstripe3
 *   - Transportbehov (page12): same-panel conditionals across kollektiv, egen bil and drosje branches
 *       kanDuReiseKollektivtDagligReise → expense field / no-collective container
 *       hvaErHovedarsakenTilAtDuIkkeKanReiseKollektivt → health/transport/barn/annet branches
 *       kanDuBenytteEgenBil → kanBenytteEgenBil / kanIkkeBenytteEgenBil containers
 *       kommerDuTilAHaUtgifterTilParkeringPaAktivitetsstedet → parkering field
 *       hvaErArsakenTilAtDuIkkeKanBenytteEgenBil / kanDuBenytteDrosje → nested alerts and fields
 *   - Vedlegg (vedlegg): 7 cross-panel attachment conditionals
 *       reiseavstand medical branch → medisinske årsaker attachment
 *       transport reason branches → kollektiv attachments
 *       own-car expenses > 0 → egen bil attachment
 *       no-car/taxi branches → egen bil/taxi attachments
 */

const setHasNorwegianIdentityNumber = (answer: 'Ja' | 'Nei') => {
  cy.findByRole('group', { name: 'Har du norsk fødselsnummer eller d-nummer?' }).within(() => {
    cy.findByRole('radio', { name: answer }).click();
  });
};

const goToVedleggFromCurrentPanel = () => {
  cy.clickShowAllSteps();
  cy.findByRole('link', { name: 'Vedlegg' }).click();
};

const chooseMainTransportReason = (
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

const chooseCanUseOwnCar = (answer: 'Ja' | 'Nei') => {
  cy.withinComponent('Kan du benytte egen bil?', () => {
    cy.findByRole('radio', { name: answer }).click();
  });
};

const chooseCannotUseOwnCarReason = (answer: 'Helsemessige årsaker' | 'Disponerer ikke bil' | 'Annet') => {
  cy.withinComponent('Hva er årsaken til at du ikke kan benytte egen bil?', () => {
    cy.findByRole('radio', { name: answer }).click();
  });
};

const fillApplicantWithFnr = () => {
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
  setHasNorwegianIdentityNumber('Ja');
  cy.findByRole('textbox', { name: /fødselsnummer eller d-nummer/i }).type('17912099997');
};

const formatDate = (date: Date) =>
  `${`${date.getDate()}`.padStart(2, '0')}.${`${date.getMonth() + 1}`.padStart(2, '0')}.${date.getFullYear()}`;

const fillReiseperiode = () => {
  const start = new Date();
  const end = new Date();
  end.setMonth(end.getMonth() + 1);
  const startDate = formatDate(start);
  const endDate = formatDate(end);

  cy.findByRole('textbox', { name: 'Startdato (dd.mm.åååå)' }).type(startDate);
  cy.findByRole('textbox', { name: 'Sluttdato (dd.mm.åååå)' }).type(endDate);
  cy.findByLabelText('Hvor mange reisedager har du per uke?').type('5');
};

const fillReiseavstandHappyPath = () => {
  cy.withinComponent('Har du en reisevei på seks kilometer eller mer?', () => {
    cy.findByRole('radio', { name: 'Ja' }).click();
  });
  cy.findByLabelText('Hvor lang reisevei har du?').type('10');
  cy.findByRole('combobox', { name: 'Velg land' }).should('have.attr', 'aria-expanded', 'false');
  cy.findByRole('textbox', { name: 'Gateadresse' }).type('Testgata 1');
  cy.findByRole('textbox', { name: 'Postnummer' }).type('0001');
  cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
};

describe('nav111221b', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
    cy.defaultInterceptsExternal();
  });

  describe('Dine opplysninger – identity conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111221b/personopplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows address fields without a Norwegian identity number and hides them with one', () => {
      cy.findByRole('group', { name: 'Bor du i Norge?' }).should('not.exist');

      setHasNorwegianIdentityNumber('Nei');
      cy.findByRole('group', { name: 'Bor du i Norge?' }).should('exist');

      setHasNorwegianIdentityNumber('Ja');
      cy.findByRole('group', { name: 'Bor du i Norge?' }).should('not.exist');
    });

    it('shows the folkeregister alert only when the applicant confirms a Norwegian identity number', () => {
      cy.contains('Nav sender svar på søknad og annen kommunikasjon til din folkeregistrerte adresse.').should(
        'not.exist',
      );

      setHasNorwegianIdentityNumber('Ja');
      cy.contains('Nav sender svar på søknad og annen kommunikasjon til din folkeregistrerte adresse.').should('exist');

      setHasNorwegianIdentityNumber('Nei');
      cy.contains('Nav sender svar på søknad og annen kommunikasjon til din folkeregistrerte adresse.').should(
        'not.exist',
      );
    });

    it('shows address validity fields when the applicant lives outside Norway', () => {
      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('not.exist');

      setHasNorwegianIdentityNumber('Nei');
      cy.findByRole('group', { name: 'Bor du i Norge?' }).within(() => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('exist');

      cy.findByRole('group', { name: 'Bor du i Norge?' }).within(() => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Gyldig fra (dd.mm.åååå)').should('not.exist');
    });
  });

  describe('Reiseavstand conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111221b/reiseavstand?sub=paper');
      cy.defaultWaits();
    });

    it('shows the medical-reason question only for trips under six kilometers', () => {
      cy.findByLabelText('Har du av medisinske årsaker behov for transport uavhengig av reisens lengde?').should(
        'not.exist',
      );

      cy.withinComponent('Har du en reisevei på seks kilometer eller mer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Har du av medisinske årsaker behov for transport uavhengig av reisens lengde?').should(
        'exist',
      );

      cy.withinComponent('Har du en reisevei på seks kilometer eller mer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Har du av medisinske årsaker behov for transport uavhengig av reisens lengde?').should(
        'not.exist',
      );
    });

    it('shows the medical documentation alert only for the yes branch', () => {
      cy.contains('Du må legge ved dokumentasjon av medisinske årsaker').should('not.exist');

      cy.withinComponent('Har du en reisevei på seks kilometer eller mer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Har du av medisinske årsaker behov for transport uavhengig av reisens lengde?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.contains('Du må legge ved dokumentasjon av medisinske årsaker').should('exist');

      cy.withinComponent('Har du av medisinske årsaker behov for transport uavhengig av reisens lengde?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.contains('Du må legge ved dokumentasjon av medisinske årsaker').should('not.exist');
    });
  });

  describe('Transportbehov – kollektiv and reason conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111221b/page12?sub=paper');
      cy.defaultWaits();
    });

    it('switches between the kollektiv expense field and the no-collective follow-up container', () => {
      cy.findByLabelText('Hvilke utgifter har du i forbindelse med reisen?').should('not.exist');
      cy.findByLabelText('Hva er hovedårsaken til at du ikke kan reise kollektivt?').should('not.exist');

      cy.withinComponent('Kan du reise kollektivt?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Hvilke utgifter har du i forbindelse med reisen?').should('exist');
      cy.findByLabelText('Hva er hovedårsaken til at du ikke kan reise kollektivt?').should('not.exist');

      cy.withinComponent('Kan du reise kollektivt?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Hvilke utgifter har du i forbindelse med reisen?').should('not.exist');
      cy.findByLabelText('Hva er hovedårsaken til at du ikke kan reise kollektivt?').should('exist');
    });

    it('shows the correct reason-specific fields for every no-collective branch', () => {
      cy.withinComponent('Kan du reise kollektivt?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      chooseMainTransportReason('Helsemessige årsaker');
      cy.contains('Du må legge ved legeerklæring på medisinske årsaker').should('exist');
      cy.findByRole('textbox', {
        name: 'Beskriv de spesielle forholdene ved reiseveien som gjør at du ikke kan reise kollektivt',
      }).should('not.exist');

      chooseMainTransportReason('Dårlig transporttilbud');
      cy.contains('Du må legge ved legeerklæring på medisinske årsaker').should('not.exist');
      cy.findByRole('textbox', {
        name: 'Beskriv de spesielle forholdene ved reiseveien som gjør at du ikke kan reise kollektivt',
      }).should('exist');
      cy.findByLabelText('Gateadressen hvor du henter eller leverer barn').should('not.exist');

      chooseMainTransportReason('Henting eller levering av barn i barnehage eller skolefritidsordning (SFO)');
      cy.findByRole('textbox', {
        name: 'Beskriv de spesielle forholdene ved reiseveien som gjør at du ikke kan reise kollektivt',
      }).should('not.exist');
      cy.findByLabelText('Gateadressen hvor du henter eller leverer barn').should('exist');
      cy.findByRole('textbox', { name: 'Postnummer' }).should('exist');
      cy.findByRole('textbox', {
        name: 'Hvilke andre årsaker er det som gjør at du ikke kan reise kollektivt?',
      }).should('not.exist');

      chooseMainTransportReason('Annet');
      cy.findByLabelText('Gateadressen hvor du henter eller leverer barn').should('not.exist');
      cy.findByRole('textbox', {
        name: 'Hvilke andre årsaker er det som gjør at du ikke kan reise kollektivt?',
      }).should('exist');
    });
  });

  describe('Transportbehov – own car and taxi conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111221b/page12?sub=paper');
      cy.defaultWaits();
      cy.withinComponent('Kan du reise kollektivt?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
    });

    it('shows own-car fields and parking follow-up only on the own-car branch', () => {
      cy.findByLabelText(/Bompenger/).should('not.exist');
      cy.findByLabelText('Hva er årsaken til at du ikke kan benytte egen bil?').should('not.exist');

      chooseCanUseOwnCar('Ja');
      cy.findByLabelText(/Bompenger/).should('exist');
      cy.findByLabelText('Hva er årsaken til at du ikke kan benytte egen bil?').should('not.exist');
      cy.findByLabelText('Oppgi forventet beløp til parkering på aktivitetsstedet per dag').should('not.exist');

      cy.withinComponent('Kommer du til å ha utgifter til parkering på aktivitetsstedet?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Oppgi forventet beløp til parkering på aktivitetsstedet per dag').should('exist');

      cy.withinComponent('Kommer du til å ha utgifter til parkering på aktivitetsstedet?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Oppgi forventet beløp til parkering på aktivitetsstedet per dag').should('not.exist');

      chooseCanUseOwnCar('Nei');
      cy.findByLabelText(/Bompenger/).should('not.exist');
      cy.findByLabelText('Hva er årsaken til at du ikke kan benytte egen bil?').should('exist');
    });

    it('shows the correct no-car and taxi follow-up fields', () => {
      chooseCanUseOwnCar('Nei');

      chooseCannotUseOwnCarReason('Helsemessige årsaker');
      cy.contains('Du må legge ved legeerklæring på medisinske årsaker.').should('exist');
      cy.findByRole('textbox', { name: 'Hvilke andre årsaker gjør at du ikke kan benytte egen bil?' }).should(
        'not.exist',
      );

      chooseCannotUseOwnCarReason('Annet');
      cy.contains('Du må legge ved dokumentasjon av andre årsaker som gjør at du ikke kan benytte egen bil').should(
        'exist',
      );
      cy.findByRole('textbox', { name: 'Hvilke andre årsaker gjør at du ikke kan benytte egen bil?' }).should('exist');

      cy.withinComponent('Kan du benytte drosje?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText(
        'Hva er den totale kostnaden du har til bruk av drosje i perioden du søker om stønad for?',
      ).should('exist');
      cy.contains('Du må legge ved dokumentasjon av utgifter til drosje').should('exist');

      cy.withinComponent('Kan du benytte drosje?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText(
        'Hva er den totale kostnaden du har til bruk av drosje i perioden du søker om stønad for?',
      ).should('not.exist');
      cy.findByRole('textbox', { name: 'Hvorfor kan du ikke benytte drosje?' }).should('exist');
      cy.contains('sannsynligvis få avslag på søknaden om stønad til reiser').should('exist');
    });
  });

  describe('Vedlegg – conditional attachments', () => {
    describe('from Reiseavstand', () => {
      beforeEach(() => {
        cy.visit('/fyllut/nav111221b/reiseavstand?sub=paper');
        cy.defaultWaits();
      });

      it('shows the medical attachment only for the medical yes branch', () => {
        cy.withinComponent('Har du en reisevei på seks kilometer eller mer?', () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        });
        cy.withinComponent('Har du av medisinske årsaker behov for transport uavhengig av reisens lengde?', () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        });

        goToVedleggFromCurrentPanel();
        cy.findByRole('group', {
          name: /Dokumentasjon av medisinske årsaker til at du har behov for transport uavhengig av reisens lengde/,
        }).should('exist');
      });
    });

    describe('from Transportbehov', () => {
      beforeEach(() => {
        cy.visit('/fyllut/nav111221b/page12?sub=paper');
        cy.defaultWaits();
        cy.withinComponent('Kan du reise kollektivt?', () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        });
      });

      it('switches between the kollektiv reason attachments', () => {
        chooseMainTransportReason('Helsemessige årsaker');
        goToVedleggFromCurrentPanel();
        cy.findByRole('group', {
          name: /Legeerklæring på medisinske årsaker til at du ikke kan reise kollektivt/,
        }).should('exist');
        cy.findByRole('group', { name: /Dokumentasjon av plass i barnehage eller skolefritidsordning/ }).should(
          'not.exist',
        );
        cy.findByRole('link', { name: 'Transportbehov' }).click();

        chooseMainTransportReason('Henting eller levering av barn i barnehage eller skolefritidsordning (SFO)');
        cy.findByRole('link', { name: 'Vedlegg' }).click();
        cy.findByRole('group', { name: /Dokumentasjon av plass i barnehage eller skolefritidsordning/ }).should(
          'exist',
        );
        cy.findByRole('group', {
          name: /Dokumentasjon av andre årsaker til at du ikke kan reise kollektivt/,
        }).should('not.exist');
        cy.findByRole('link', { name: 'Transportbehov' }).click();

        chooseMainTransportReason('Annet');
        cy.findByRole('link', { name: 'Vedlegg' }).click();
        cy.findByRole('group', {
          name: /Dokumentasjon av andre årsaker til at du ikke kan reise kollektivt/,
        }).should('exist');
      });

      it('shows the own-car expense attachment only after entering an expense amount', () => {
        chooseCanUseOwnCar('Ja');
        goToVedleggFromCurrentPanel();
        cy.findByRole('group', { name: /Dokumentasjon av utgifter knyttet til bruk av egen bil/ }).should('not.exist');

        cy.findByRole('link', { name: 'Transportbehov' }).click();
        cy.findByLabelText(/Bompenger/).type('30');
        cy.findByRole('link', { name: 'Vedlegg' }).click();
        cy.findByRole('group', { name: /Dokumentasjon av utgifter knyttet til bruk av egen bil/ }).should('exist');
      });

      it('shows the no-car and taxi attachments for the matching branches', () => {
        chooseCanUseOwnCar('Nei');
        chooseCannotUseOwnCarReason('Helsemessige årsaker');
        goToVedleggFromCurrentPanel();
        cy.findByRole('group', {
          name: /Legeerklæring på helsemessige årsaker til at du ikke kan benytte egen bil/,
        }).should('exist');
        cy.findByRole('group', { name: /Dokumentasjon av andre årsaker til at du ikke kan benytte egen bil/ }).should(
          'not.exist',
        );
        cy.findByRole('link', { name: 'Transportbehov' }).click();

        chooseCannotUseOwnCarReason('Annet');
        cy.findByRole('link', { name: 'Vedlegg' }).click();
        cy.findByRole('group', { name: /Dokumentasjon av andre årsaker til at du ikke kan benytte egen bil/ }).should(
          'exist',
        );
        cy.findByRole('group', { name: /Dokumentasjon av utgifter til drosje/ }).should('not.exist');
        cy.findByRole('link', { name: 'Transportbehov' }).click();

        cy.withinComponent('Kan du benytte drosje?', () => {
          cy.findByRole('radio', { name: 'Ja' }).click();
        });
        cy.findByRole('link', { name: 'Vedlegg' }).click();
        cy.findByRole('group', { name: /Dokumentasjon av utgifter til drosje/ }).should('exist');
      });
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav111221b?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills the required happy path and verifies the summary', () => {
      // Veiledning
      cy.clickNextStep();

      // Dine opplysninger
      fillApplicantWithFnr();
      cy.clickNextStep();

      // Din situasjon
      cy.findByRole('checkbox', {
        name: /Mottar arbeidsavklaringspenger \(AAP\), uføretrygd eller har nedsatt arbeidsevne/,
      }).check();
      cy.clickNextStep();

      // Reiseperiode
      fillReiseperiode();
      cy.clickNextStep();

      // Reiseavstand
      fillReiseavstandHappyPath();
      cy.clickNextStep();

      // Transportbehov
      cy.withinComponent('Kan du reise kollektivt?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Hvilke utgifter har du i forbindelse med reisen?').type('150');
      cy.clickNextStep();

      // Tilleggsopplysninger
      goToVedleggFromCurrentPanel();

      // Vedlegg
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: 'Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved' }).click();
      });
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.contains('dt', 'Fornavn').next('dd').should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Transportbehov', () => {
        cy.contains('dt', 'Kan du reise kollektivt?').next('dd').should('contain.text', 'Ja');
      });
    });
  });
});
