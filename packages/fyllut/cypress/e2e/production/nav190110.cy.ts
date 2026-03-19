/*
 * Production form tests for Endring av alderspensjon
 * Form: nav190110
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Veiledning (veiledning): HTML only, no conditionals, no required fields
 *   - Dine opplysninger (personopplysninger): 3 required fields, no conditionals
 *   - Endring i pensjonsuttak (page4): 1 conditional
 *       skalDuEndreUttaksgradEllerSkalDuStanseUtbetalingAvAlderspensjon → velgUttaksgradenDuOnskerAEndreTil
 *   - Oppdatert opptjening (page5): 1 required radiopanel, no conditionals
 *   - Tidspunkt for endring (page6): 1 required monthPicker, no conditionals
 *   - Erklæring (page7): 1 required checkbox, no conditionals
 *   - Vedlegg (vedlegg): isAttachmentPanel=true — use stepper + 1×clickNextStep to reach Oppsummering
 */

describe('nav190110', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Endring i pensjonsuttak conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav190110/page4?sub=paper');
      cy.defaultWaits();
    });

    it('shows uttaksgrad selector only when Endre uttaksgrad is selected', () => {
      cy.findByLabelText(/Velg uttaksgraden du ønsker å endre til/).should('not.exist');

      cy.withinComponent('Skal du endre uttaksgrad eller skal du stanse utbetaling av alderspensjon?', () => {
        cy.findByRole('radio', { name: 'Endre uttaksgrad' }).click();
      });

      cy.findByLabelText(/Velg uttaksgraden du ønsker å endre til/).should('exist');

      cy.withinComponent('Skal du endre uttaksgrad eller skal du stanse utbetaling av alderspensjon?', () => {
        cy.findByRole('radio', { name: 'Stanse utbetaling' }).click();
      });

      cy.findByLabelText(/Velg uttaksgraden du ønsker å endre til/).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav190110?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep(); // pre-wizard landing → Veiledning
    });

    it('fills required fields and verifies summary', () => {
      // Veiledning – no required fields, navigate forward
      cy.clickNextStep(); // Veiledning → Dine opplysninger

      // Dine opplysninger
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      // Endring i pensjonsuttak
      cy.withinComponent('Skal du endre uttaksgrad eller skal du stanse utbetaling av alderspensjon?', () => {
        cy.findByRole('radio', { name: 'Endre uttaksgrad' }).click();
      });
      cy.withinComponent(/Velg uttaksgraden du ønsker å endre til/, () => {
        cy.findByRole('radio', { name: '100' }).click();
      });
      cy.clickNextStep();

      // Oppdatert opptjening
      cy.withinComponent('Ønsker du å inkludere ny opptjening i beregning av pensjonen?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });
      cy.clickNextStep();

      // Tidspunkt for endring – monthPicker uses mm.åååå format; must be ≥ 2026
      cy.findByRole('textbox', { name: /Ønsket tidspunkt for endring/ }).type('01.2026');
      cy.clickNextStep();

      // Erklæring
      cy.findByRole('checkbox', { name: /Jeg er kjent med at NAV/ }).check();

      // Vedlegg – isAttachmentPanel=true, last panel before Oppsummering (Case A)
      // Use stepper to navigate there; sequential clickNextStep() would skip it
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /ettersender|Nei/ }).click();
      });

      // One clickNextStep() — Vedlegg is last, goes directly to Oppsummering
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Endring i pensjonsuttak', () => {
        cy.get('dt').eq(0).should('contain.text', 'Skal du endre uttaksgrad');
        cy.get('dd').eq(0).should('contain.text', 'Endre uttaksgrad');
      });
    });
  });
});
