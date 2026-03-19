/*
 * Production form tests for Søknad om dekning av ekstraordinære veterinærutgifter for førerhund eller servicehund
 * Form: nav100753
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Dine opplysninger (dineOpplysninger): 2 customConditionals
 *       identitet.harDuFodselsnummer → adresse visibility (and alertstripe)
 *       adresse.borDuINorge → adresseVarighet visibility
 *   - Behov (behov): 1 same-panel required radiopanel
 *       harDuFattUtbetalingFraForsikringsselskapet → cross-panel conditional to Vedlegg
 *   - Vedlegg (vedlegg): 1 cross-panel conditional from harDuFattUtbetalingFraForsikringsselskapet
 *       dokumentasjonAvUtbetalingFraForsikringsselskap shown only when ja
 *
 * Note: Vedlegg has isAttachmentPanel=true. In paper mode, sequential cy.clickNextStep()
 * from Behov skips Vedlegg. Use cy.clickShowAllSteps() + stepper to navigate there.
 * After filling Vedlegg and Erklæring via stepper, two cy.clickNextStep() calls are needed
 * to reach Oppsummering (the first reinserts Vedlegg into the sequential wizard flow).
 *
 * Summary runs first to avoid wizard-state leakage from cross-panel stepper navigation.
 */

describe('nav100753', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  // Summary first — before cross-panel tests contaminate wizard state via stepper navigation
  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100753?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – confirm checkbox
      cy.findByRole('checkbox', {
        name: 'Jeg bekrefter at jeg vil svare så riktig som jeg kan.',
      }).check();
      cy.clickNextStep();

      // Dine opplysninger – use fnr path (adresse section hidden when fnr provided)
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByLabelText('Telefonnummer').type('12345678');
      cy.clickNextStep();

      // Behov – fill required fields; choose nei (no cross-panel insurance attachment)
      cy.findByRole('textbox', { name: 'Førerhundens eller servicehundens navn' }).type('Rex');
      cy.findByRole('textbox', {
        name: 'Beskriv årsaken til at hunden trenger eller trengte behandling hos veterinær',
      }).type('Hunden skadet seg under trening.');
      cy.findByRole('textbox', { name: 'Hva går behandlingen ut på?' }).type('Operasjon av benet.');
      cy.findByRole('textbox', { name: 'Hva vil totalkostnadene bli?' }).type('15000');
      cy.withinComponent('Har du fått utbetaling fra forsikringsselskapet?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      // Vedlegg – isAttachmentPanel=true skips this panel via sequential Next; use stepper
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Uttalelse fra veterinær/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });

      // Erklæring – stepper already expanded; navigate directly
      cy.findByRole('link', { name: 'Erklæring' }).click();
      cy.findByRole('checkbox', {
        name: 'Jeg erklærer at de oppgitte opplysningene er korrekte.',
      }).check();

      // Two clickNextStep needed: wizard reinserts Vedlegg step, then advances to Oppsummering
      cy.clickNextStep(); // Erklæring → Vedlegg (wizard reinserts missed attachment panel)
      cy.clickNextStep(); // Vedlegg → Oppsummering (attachment and declaration already filled)

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Kari');
      });
      cy.withinSummaryGroup('Behov', () => {
        cy.get('dt').eq(0).should('contain.text', 'Førerhundens eller servicehundens navn');
        cy.get('dd').eq(0).should('contain.text', 'Rex');
      });
    });
  });

  describe('Dine opplysninger – identity conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100753/dineOpplysninger?sub=paper');
      cy.defaultWaits();
    });

    it('shows adresse section when user has no fnr', () => {
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('exist');
    });

    it('hides adresse section when user has fnr', () => {
      cy.withinComponent('Har du norsk fødselsnummer eller d-nummer?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByLabelText('Bor du i Norge?').should('not.exist');
    });
  });

  describe('Vedlegg – cross-panel conditional from harDuFattUtbetalingFraForsikringsselskapet', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav100753/behov?sub=paper');
      cy.defaultWaits();
    });

    it('shows insurance documentation attachment when utbetaling er ja', () => {
      cy.withinComponent('Har du fått utbetaling fra forsikringsselskapet?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByLabelText('Dokumentasjon av utbetaling fra forsikringsselskap').should('exist');
    });

    it('hides insurance documentation attachment when utbetaling er nei', () => {
      cy.withinComponent('Har du fått utbetaling fra forsikringsselskapet?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByLabelText('Dokumentasjon av utbetaling fra forsikringsselskap').should('not.exist');
    });
  });
});
