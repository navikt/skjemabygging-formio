/*
 * Production form tests for Forsikring mot ansvar for sykepenger i arbeidsgiverperioden
 * for små bedrifter - krav om refusjon
 * Form: nav082115
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Om arbeidstakeren (omArbeidstakeren): 2 same-panel conditionals
 *       NorskFodselsnummerEllerDNummer=ja → fodselsnummerDNummerArbeidstaker (fnr field)
 *       NorskFodselsnummerEllerDNummer=nei → alertstripe (warning about missing fnr)
 *   - Om sykefraværet (omSykefravaeret): 1 same-panel conditional
 *       hvilketArbeidsforholdHarArbeidstager=deltid → perioderArbeidstagerSkulleHaArbeidet (datagrid)
 *
 * Note: Vedlegg has isAttachmentPanel=true (last panel). Sequential clickNextStep() skips it.
 * Use cy.clickShowAllSteps() + stepper to navigate there, then one clickNextStep() to reach Oppsummering.
 */

describe('nav082115', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Om arbeidstakeren – fnr conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav082115/omArbeidstakeren?sub=paper');
      cy.defaultWaits();
    });

    it('shows fnr field when arbeidstaker har fødselsnummer', () => {
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('not.exist');

      cy.withinComponent('Har arbeidstakeren norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('exist');

      cy.withinComponent('Har arbeidstakeren norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).should('not.exist');
    });

    it('shows warning alert when arbeidstaker ikke har fødselsnummer', () => {
      cy.contains('Arbeidstaker må ha norsk fødselsnummer').should('not.exist');

      cy.withinComponent('Har arbeidstakeren norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });
      cy.contains('Arbeidstaker må ha norsk fødselsnummer').should('exist');

      cy.withinComponent('Har arbeidstakeren norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.contains('Arbeidstaker må ha norsk fødselsnummer').should('not.exist');
    });
  });

  describe('Om sykefraværet – arbeidsforhold conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav082115/omSykefravaeret?sub=paper');
      cy.defaultWaits();
    });

    it('shows perioder datagrid when deltid is selected', () => {
      cy.findByRole('textbox', { name: 'Fra dato (dd.mm.åååå)' }).should('not.exist');

      cy.withinComponent('Hvilket arbeidsforhold har arbeidstaker?', () => {
        cy.findByRole('radio', { name: 'Deltid' }).click();
      });
      cy.findByRole('textbox', { name: 'Fra dato (dd.mm.åååå)' }).should('exist');

      cy.withinComponent('Hvilket arbeidsforhold har arbeidstaker?', () => {
        cy.findByRole('radio', { name: 'Fulltid' }).click();
      });
      cy.findByRole('textbox', { name: 'Fra dato (dd.mm.åååå)' }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav082115?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – no required fields
      cy.clickNextStep();

      // Om arbeidstakeren – use fnr path
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har arbeidstakeren norsk fødselsnummer eller D-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Om arbeidsforholdet
      cy.findByRole('textbox', { name: /Når startet arbeidsforholdet/ }).type('01.01.2023');
      cy.clickNextStep();

      // Om sykefraværet – fulltid path (no extra datagrid)
      cy.findAllByRole('textbox', { name: 'F.o.m. dato (dd.mm.åååå)' }).first().type('01.01.2025');
      cy.findAllByRole('textbox', { name: 'T.o.m. dato (dd.mm.åååå)' }).first().type('16.01.2025');
      cy.withinComponent('Hvilket arbeidsforhold har arbeidstaker?', () => {
        cy.findByRole('radio', { name: 'Fulltid' }).click();
      });
      cy.clickNextStep();

      // Arbeidstakerens inntekt
      cy.findByRole('textbox', { name: /Gjennomsnittlig månedsinntekt/ }).type('50000');
      cy.clickNextStep();

      // Refusjonskrav
      cy.findByRole('textbox', { name: /Utbetalte sykepenger i perioden/ }).type('15000');
      cy.findAllByRole('textbox', { name: 'Fra dato (dd.mm.åååå)' }).first().type('01.01.2025');
      cy.findAllByRole('textbox', { name: 'Til dato (dd.mm.åååå)' }).first().type('16.01.2025');
      cy.findByRole('textbox', { name: 'Refusjonskrav' }).type('15000');
      cy.clickNextStep();

      // Om arbeidsgiver – fill without clicking Next (Vedlegg is isAttachmentPanel)
      cy.findByRole('textbox', { name: 'Arbeidsgiver' }).type('Test Bedrift AS');
      cy.findByRole('textbox', { name: 'Organisasjonsnummer' }).type('974760673');
      cy.findByRole('textbox', { name: 'Underenhet' }).type('974760673');
      cy.findByRole('textbox', { name: 'Antall ansatte' }).type('5');

      // Vedlegg – isAttachmentPanel=true; use stepper to navigate there
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /ettersender|Nei/ }).click();
      });

      // One clickNextStep from Vedlegg (last panel) → Oppsummering
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Om arbeidstakeren', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Kari');
      });
      cy.withinSummaryGroup('Om arbeidsgiver', () => {
        cy.get('dt').eq(0).should('contain.text', 'Arbeidsgiver');
        cy.get('dd').eq(0).should('contain.text', 'Test Bedrift AS');
      });
    });
  });
});
