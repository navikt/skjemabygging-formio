/*
 * Production form tests for Meldekort for arbeidssøkere
 * Form: nav001004
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Dine opplysninger (personopplysninger): 3 customConditionals
 *       identitet.harDuFodselsnummer → adresse/navAddress (show when "nei")
 *       adresse.borDuINorge → adresseVarighet (show when "nei")
 *       identitet.identitetsnummer && !harDuFodselsnummer → alertstripePrefill (display-only, skip)
 *   - Jobb (jobb): 3 simple conditionals (same trigger)
 *       harDuJobbetIPerioden1 → navSkjemagruppe1 + navSkjemagruppe2 (show when "ja")
 *   - Syk (syk): 1 simple conditional
 *       harDuVaertSykIPerioden → kryssAvForDageneDuHarVaertSyk (show when "ja")
 *   - Ferie, fravær eller utenlandsopphold (ferieFravaerEllerUtenlandsopphold): 1 simple conditional
 *       harDuHattFerieFravaerEllerUtenlandsopphold → selectboxes (show when "ja")
 *   - Tiltak, kurs, eller utdanning (tiltakKursEllerUtdanning): 1 simple conditional
 *       harDuDeltattPaTiltakKursEllerUtdanning → selectboxes (show when "ja")
 *
 * Note: Vedlegg has isAttachmentPanel=true (last panel). Sequential clickNextStep() skips it.
 * Use cy.clickShowAllSteps() + stepper, then ONE clickNextStep() to reach Oppsummering.
 * Note: introPage.enabled=true — call cy.clickIntroPageConfirmation() only at root URL.
 */

describe('nav001004', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Dine opplysninger – identity and address conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav001004/personopplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows address section when user has no Norwegian FNR', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
    });

    it('shows adresseVarighet date fields when living abroad', () => {
      // Make address section visible first
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Bor du i Norge?').should('exist');

      // adresseVarighet not yet visible
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('not.exist');

      // Select Nei for borDuINorge → adresseVarighet appears
      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('exist');

      // Select Ja for borDuINorge → adresseVarighet hidden (no address type chosen)
      cy.withinComponent('Bor du i Norge?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /Gyldig fra/ }).should('not.exist');
    });
  });

  describe('Jobb – work hours conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav001004/jobb?sub=paper');
      cy.defaultWaits();
    });

    it('shows work hours groups when worked in period', () => {
      cy.findByLabelText('Mandag').should('not.exist');

      cy.withinComponent('Har du jobbet i perioden?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      // Both navSkjemagruppe1 and navSkjemagruppe2 appear — each has a Mandag field
      cy.findAllByLabelText('Mandag').should('have.length', 2);

      cy.withinComponent('Har du jobbet i perioden?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByLabelText('Mandag').should('not.exist');
    });
  });

  describe('Syk – sick days conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav001004/syk?sub=paper');
      cy.defaultWaits();
    });

    it('shows sick day checkboxes when was sick in period', () => {
      cy.findByRole('group', { name: /Kryss av for dagene du har vært syk/ }).should('not.exist');

      cy.withinComponent('Har du vært syk i perioden?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('group', { name: /Kryss av for dagene du har vært syk/ }).should('exist');

      cy.withinComponent('Har du vært syk i perioden?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('group', { name: /Kryss av for dagene du har vært syk/ }).should('not.exist');
    });
  });

  describe('Ferie, fravær eller utenlandsopphold – absence days conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav001004/ferieFravaerEllerUtenlandsopphold?sub=paper');
      cy.defaultWaits();
    });

    it('shows absence day checkboxes when had absence', () => {
      cy.findByRole('group', { name: /Kryss av for de dagene du har hatt/ }).should('not.exist');

      cy.withinComponent('Har du hatt ferie, fravær eller utenlandsopphold?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('group', { name: /Kryss av for de dagene du har hatt/ }).should('exist');

      cy.withinComponent('Har du hatt ferie, fravær eller utenlandsopphold?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('group', { name: /Kryss av for de dagene du har hatt/ }).should('not.exist');
    });
  });

  describe('Tiltak, kurs, eller utdanning – course days conditional', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav001004/tiltakKursEllerUtdanning?sub=paper');
      cy.defaultWaits();
    });

    it('shows course day checkboxes when participated in courses', () => {
      cy.findByRole('group', { name: /Kryss av for de dagene du har deltatt/ }).should('not.exist');

      cy.withinComponent('Har du deltatt på tiltak, kurs eller utdanning?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('group', { name: /Kryss av for de dagene du har deltatt/ }).should('exist');

      cy.withinComponent('Har du deltatt på tiltak, kurs eller utdanning?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('group', { name: /Kryss av for de dagene du har deltatt/ }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav001004?sub=paper');
      cy.defaultWaits();
      cy.clickIntroPageConfirmation();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Dine opplysninger – use Norwegian FNR path (adresse/adresseVarighet remain hidden)
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Nåværende periode – fill required number/year fields
      cy.findByLabelText('Fra uke').type('1');
      cy.findByLabelText('Til uke').type('2');
      cy.findByLabelText('År').type('2025');
      cy.clickNextStep();

      // Jobb – select Nei to avoid filling all work-hour fields
      cy.withinComponent('Har du jobbet i perioden?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Syk – select Nei
      cy.withinComponent('Har du vært syk i perioden?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Ferie, fravær eller utenlandsopphold – select Nei
      cy.withinComponent('Har du hatt ferie, fravær eller utenlandsopphold?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.clickNextStep();

      // Tiltak, kurs, eller utdanning – select Nei
      cy.withinComponent('Har du deltatt på tiltak, kurs eller utdanning?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      // Vedlegg – isAttachmentPanel=true (last panel); sequential Next skips it — use stepper
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /ettersender|Nei/ }).click();
      });

      // ONE clickNextStep from Vedlegg (last panel) → Oppsummering
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Nåværende periode', () => {
        cy.get('dt').eq(1).should('contain.text', 'Fra uke');
        cy.get('dd').eq(1).should('contain.text', '1');
      });
    });
  });
});
