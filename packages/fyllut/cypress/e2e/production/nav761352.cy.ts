/*
 * Production form tests for Avtale om medfinansiering – VTA
 * Form: nav761352
 * Submission types: none (no ?sub= param)
 *
 * Panels:
 *   - Bakgrunn (bakgrunn): info-only, no required fields, no conditionals
 *   - Avtale om medfinansiering (avtaleOmMedfinansiering): 1 required number field
 *   - Avtaleparter (avtaleparter): date, Tiltaksbedrift, Kommune (all required)
 *
 * No conditionals — single summary test only.
 */

describe('nav761352', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Summary', () => {
    beforeEach(() => {
      // Visit the first panel with required fields directly to skip the
      // submission-type chooser (step 1) and the info-only Bakgrunn panel.
      cy.visit('/fyllut/nav761352/avtaleOmMedfinansiering');
      cy.defaultWaits();
    });

    it('fills required fields and verifies summary', () => {
      // Panel: Avtale om medfinansiering (number field — use findByLabelText)
      cy.findByLabelText('Hva er medfinansieringssatsen satt til i denne avtalen?').type('30');
      cy.clickNextStep();

      // Panel: Avtaleparter
      cy.findByRole('textbox', { name: /Fra hvilken dato gjelder denne avtalen/ }).type('01.10.2025');
      cy.findByRole('textbox', { name: 'Tiltaksbedrift' }).type('Test bedrift');
      cy.findByRole('textbox', { name: 'Kommune' }).type('Test kommune');
      cy.clickNextStep();

      // Summary
      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');

      cy.withinSummaryGroup('Avtale om medfinansiering', () => {
        cy.get('dt').eq(0).should('contain.text', 'Hva er medfinansieringssatsen satt til i denne avtalen?');
        cy.get('dd').eq(0).should('contain.text', '30');
      });

      cy.withinSummaryGroup('Avtaleparter', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fra hvilken dato gjelder denne avtalen?');
        cy.get('dd').eq(0).should('contain.text', '01.10.2025');
      });
    });
  });
});
