/*
 * Production form tests for Søknad om stønad til arbeids- og utdanningsreiser
 * Form: nav761300
 * Submission types: PAPER, DIGITAL
 * introPage.enabled: true — clickIntroPageConfirmation() required before clickNextStep() from root
 *
 * Panels tested:
 *   - Dine opplysninger (dineOpplysninger): 2 customConditionals
 *       identitet.harDuFodselsnummer → adresse visibility
 *   - Hva du søker om (hvaDuSokerOm): selectboxes → 6 cross-panel triggers
 *       gjelderSoknadenReiseTilArbeidEllerReiseTilUtdanning (reiseTilArbeid/reiseTilUtdanning)
 *         → omArbeidsEllerUtdanningsstedet: arbeid/utdanning sections
 *         → varighet: arbeid date fields + tilOgMed conditional
 *         → alternativeStonadsordninger: arbeid/utdanning TT-kort questions
 *   - Alternative stønadsordninger (alternativeStonadsordninger): 2 same-panel conditionals
 *       mottarDuStonadTilBilFraFolketrygden → hvorforKanIkkeBilBenyttesTilArbeidsOgUtdanningsreiser
 *       hvorforKanIkkeBilBenyttesTilArbeidsOgUtdanningsreiser=annet → beskrivHvorfor textarea
 *   - Vedlegg (vedlegg, isAttachmentPanel=true): 1 cross-panel conditional attachment
 *       harDuHonnorkort (honnorkort panel) → kopiAvHonnorkort1
 */

describe('nav761300', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Dine opplysninger – identity conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav761300?sub=paper');
      cy.defaultWaits();
      cy.clickIntroPageConfirmation();
      cy.clickNextStep();
    });

    it('shows adresse section when identitet.harDuFodselsnummer is nei', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('exist');
    });

    it('keeps adresse section hidden when identitet.harDuFodselsnummer is ja', () => {
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('not.exist');
    });
  });

  describe('Hva du søker om – cross-panel conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav761300/hvaDuSokerOm?sub=paper');
      cy.defaultWaits();
    });

    it('shows arbeid section and hides utdanning section on Om arbeids-panel when reiseTilArbeid', () => {
      cy.findByRole('group', {
        name: 'Gjelder søknaden reise til arbeid eller reise til utdanning?',
      }).within(() => {
        cy.findByRole('checkbox', { name: 'Reise til arbeid' }).check();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Om arbeids- eller utdanningsstedet' }).click();

      cy.findByRole('textbox', { name: 'Arbeidsgiver' }).should('exist');
      cy.findByRole('textbox', { name: 'Utdanningssted' }).should('not.exist');
    });

    it('shows utdanning section and hides arbeid section on Om arbeids-panel when reiseTilUtdanning', () => {
      cy.findByRole('group', {
        name: 'Gjelder søknaden reise til arbeid eller reise til utdanning?',
      }).within(() => {
        cy.findByRole('checkbox', { name: 'Reise til utdanning' }).check();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Om arbeids- eller utdanningsstedet' }).click();

      cy.findByRole('textbox', { name: 'Utdanningssted' }).should('exist');
      cy.findByRole('textbox', { name: 'Arbeidsgiver' }).should('not.exist');
    });

    it('shows arbeid varighet fields and tilOgMed date when midlertidig selected', () => {
      cy.findByRole('group', {
        name: 'Gjelder søknaden reise til arbeid eller reise til utdanning?',
      }).within(() => {
        cy.findByRole('checkbox', { name: 'Reise til arbeid' }).check();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Varighet' }).click();

      cy.findByLabelText('Er arbeidsforholdet fast eller midlertidig?').should('exist');
      cy.findByRole('textbox', { name: 'Fra og med (dd.mm.åååå)' }).should('exist');
      cy.findByLabelText('Når startet utdanningen? (dd.mm.åååå)').should('not.exist');

      cy.findByRole('textbox', { name: 'Til og med (dd.mm.åååå)' }).should('not.exist');

      cy.withinComponent('Er arbeidsforholdet fast eller midlertidig?', () => {
        cy.findByRole('radio', { name: 'Midlertidig' }).click();
      });

      cy.findByRole('textbox', { name: 'Til og med (dd.mm.åååå)' }).should('exist');
    });

    it('shows utdanning varighet dates and hides arbeid fields when reiseTilUtdanning', () => {
      cy.findByRole('group', {
        name: 'Gjelder søknaden reise til arbeid eller reise til utdanning?',
      }).within(() => {
        cy.findByRole('checkbox', { name: 'Reise til utdanning' }).check();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Varighet' }).click();

      cy.findByLabelText('Når startet utdanningen? (dd.mm.åååå)').should('exist');
      cy.findByLabelText('Når skal utdanningen være avsluttet? (dd.mm.åååå)').should('exist');
      cy.findByLabelText('Er arbeidsforholdet fast eller midlertidig?').should('not.exist');
    });

    it('shows arbeid TT-kort and hides utdanning TT-kort when reiseTilArbeid', () => {
      cy.findByRole('group', {
        name: 'Gjelder søknaden reise til arbeid eller reise til utdanning?',
      }).within(() => {
        cy.findByRole('checkbox', { name: 'Reise til arbeid' }).check();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Alternative stønadsordninger' }).click();

      cy.findByLabelText(
        'Har du tilrettelagt transport (TT-kort) til arbeidsreiser fra kommunen/fylkeskommunen?',
      ).should('exist');
      cy.findByLabelText(
        'Har du tilrettelagt transport (TT-kort) til utdanningsreiser fra kommunen/fylkeskommunen?',
      ).should('not.exist');
    });

    it('shows utdanning TT-kort and hides arbeid TT-kort when reiseTilUtdanning', () => {
      cy.findByRole('group', {
        name: 'Gjelder søknaden reise til arbeid eller reise til utdanning?',
      }).within(() => {
        cy.findByRole('checkbox', { name: 'Reise til utdanning' }).check();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Alternative stønadsordninger' }).click();

      cy.findByLabelText(
        'Har du tilrettelagt transport (TT-kort) til utdanningsreiser fra kommunen/fylkeskommunen?',
      ).should('exist');
      cy.findByLabelText(
        'Har du tilrettelagt transport (TT-kort) til arbeidsreiser fra kommunen/fylkeskommunen?',
      ).should('not.exist');
    });
  });

  describe('Alternative stønadsordninger – same-panel conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav761300/alternativeStonadsordninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows hvorfor-bil question when stonadTilBil is ja', () => {
      cy.findByLabelText('Hvorfor kan ikke bil benyttes til arbeids- og utdanningsreiser?').should('not.exist');

      cy.withinComponent('Mottar du stønad til bil fra folketrygden?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Hvorfor kan ikke bil benyttes til arbeids- og utdanningsreiser?').should('exist');
    });

    it('shows beskrivHvorfor textarea when hvorfor = annet', () => {
      cy.findByRole('textbox', {
        name: 'Beskriv hvorfor bil ikke kan benyttes til arbeids- og utdanningsreiser',
      }).should('not.exist');

      cy.withinComponent('Mottar du stønad til bil fra folketrygden?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.withinComponent('Hvorfor kan ikke bil benyttes til arbeids- og utdanningsreiser?', () => {
        cy.findByRole('radio', { name: 'Annet' }).click();
      });

      cy.findByRole('textbox', {
        name: 'Beskriv hvorfor bil ikke kan benyttes til arbeids- og utdanningsreiser',
      }).should('exist');
    });
  });

  describe('Vedlegg – conditional attachment for honnørkort', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav761300/honnorkort?sub=paper');
      cy.defaultWaits();
    });

    it('shows kopiAvHonnorkort attachment when harDuHonnorkort is ja', () => {
      cy.withinComponent('Har du honnørkort?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Kopi av honnørkort/ }).should('exist');
    });

    it('hides kopiAvHonnorkort attachment when harDuHonnorkort is nei', () => {
      cy.withinComponent('Har du honnørkort?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Kopi av honnørkort/ }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav761300?sub=paper');
      cy.defaultWaits();
      cy.clickIntroPageConfirmation();
      cy.clickNextStep();
    });

    it('fills required fields for reiseTilArbeid path and verifies summary', () => {
      // Dine opplysninger — use fnr path (adresse/adresseVarighet hidden)
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Hva du søker om — choose reiseTilArbeid
      cy.findByRole('group', {
        name: 'Gjelder søknaden reise til arbeid eller reise til utdanning?',
      }).within(() => {
        cy.findByRole('checkbox', { name: 'Reise til arbeid' }).check();
      });
      cy.clickNextStep();

      // Om arbeids- eller utdanningsstedet — arbeid group visible, utdanning hidden
      cy.findByRole('textbox', { name: 'Arbeidsgiver' }).type('NAV');
      cy.findByLabelText('Oppgi din stillingsprosent').type('100');
      cy.findByRole('textbox', { name: 'Adresse til arbeidsgiver' }).type('Gateveien 1');
      cy.findByRole('textbox', { name: 'Postnummer' }).first().type('0151');
      cy.findByRole('textbox', { name: 'Poststed' }).first().type('Oslo');
      cy.withinComponent('Har du flere oppmøtesteder for denne arbeidsgiveren?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Hvor mange dager per uke reiser du til arbeid?').type('5');
      cy.clickNextStep();

      // Varighet — arbeid fields visible, select fast (tilOgMed stays hidden)
      cy.withinComponent('Er arbeidsforholdet fast eller midlertidig?', () => {
        cy.findByRole('radio', { name: 'Fast' }).click();
      });
      cy.findByRole('textbox', { name: 'Fra og med (dd.mm.åååå)' }).type('01.01.2025');
      cy.clickNextStep();

      // Alternative stønadsordninger — no bil, no grunnstønad
      cy.withinComponent('Mottar du grunnstønad til transport til arbeid eller utdanning fra folketrygden?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent('Mottar du stønad til bil fra folketrygden?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.withinComponent(
        'Har du tilrettelagt transport (TT-kort) til arbeidsreiser fra kommunen/fylkeskommunen?',
        () => {
          cy.findByRole('radio', { name: 'Nei' }).click();
        },
      );
      cy.withinComponent('Mottar du stønad til daglige reiseutgifter fra NAV eller andre?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Honnørkort — nei (kopiAvHonnorkort not required in Vedlegg)
      cy.withinComponent('Har du honnørkort?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Tilleggsopplysninger — no required fields; use stepper to reach Vedlegg
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      // Vedlegg (isAttachmentPanel=true) — fill required attachments
      // kopiAvHonnorkort1 is hidden (harDuHonnorkort=nei)
      cy.findByRole('group', {
        name: /Legeerklæring ved søknad om arbeids- og utdanningsreiser/,
      }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.findByRole('group', { name: /Dokumentasjon av arbeid eller utdanning/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei/ }).click();
      });
      cy.clickNextStep();

      // Oppsummering
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Hva du søker om', () => {
        cy.get('dt').eq(0).should('contain.text', 'Gjelder søknaden reise til arbeid eller reise til utdanning?');
        cy.get('dd').eq(0).should('contain.text', 'Reise til arbeid');
      });
    });
  });
});
