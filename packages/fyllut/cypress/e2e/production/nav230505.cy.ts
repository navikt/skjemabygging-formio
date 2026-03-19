/*
 * Production form tests for Terminoppgave for produktavgift til folketrygden
 * Form: nav230505
 * Submission types: none (no ?sub= param)
 *
 * Panels:
 *   - Veiledning (veiledning): HTML only, no fields
 *   - Avgiftstermin (avgiftstermin): 2 required fields, 0 conditionals
 *       navnetPaFiskesalgslaget (textfield, required)
 *       forHvilkenTerminGjelderDenneOppgaven (selectboxes, required)
 *   - Produktavgift (produktavgift): 4 required currency fields, 0 conditionals
 *   - Merknader (merknader): 1 optional textarea, 0 conditionals
 */

describe('nav230505', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav230505/avgiftstermin');
      cy.defaultWaits();
    });

    it('fills required fields across all panels and verifies summary', () => {
      // Avgiftstermin
      cy.findByRole('textbox', { name: 'Navnet på fiskesalgslaget' }).type('Test Fiskesalgslag');
      cy.findByRole('group', { name: 'For hvilken termin gjelder denne oppgaven?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Januar - Februar' }).check();
      });
      cy.clickNextStep();

      // Produktavgift
      cy.findByRole('textbox', { name: 'Trekkgrunnlag for produktavgift' }).type('100000');
      cy.findByRole('textbox', { name: 'Beregnet produktavgift' }).type('2500');
      cy.findByRole('textbox', { name: 'Fradrag på grunn av avrundinger' }).type('0');
      cy.findByRole('textbox', { name: 'Innkrevet produktavgift' }).type('2500');
      cy.clickNextStep();

      // Merknader — optional textarea, skip
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');

      cy.withinSummaryGroup('Avgiftstermin', () => {
        cy.get('dt').eq(0).should('contain.text', 'Navnet på fiskesalgslaget');
        cy.get('dd').eq(0).should('contain.text', 'Test Fiskesalgslag');
      });

      cy.withinSummaryGroup('Produktavgift', () => {
        cy.get('dt').eq(0).should('contain.text', 'Trekkgrunnlag for produktavgift');
        cy.get('dd').eq(0).should('contain.text', 'NOK');
      });
    });
  });
});
