/*
 * Production form tests for Leveattest
 * Form: nav210305
 * Submission types: PAPER
 *
 * Panels:
 *   - Veiledning (veiledning): informational only, no required fields, no conditionals
 *   - Dine opplysninger (personopplysninger): 3 required fields (Fornavn, Etternavn,
 *     Fødselsnummer / D-nummer), no real conditionals
 *
 * 0 conditionals — single summary test only.
 */

describe('nav210305', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav210305?sub=paper');
      cy.defaultWaits();
      cy.clickNextStep(); // Veiledning has no fields — advance to Dine opplysninger
    });

    it('fills required fields and verifies summary', () => {
      // Panel: Veiledning — no required fields, advance to next panel
      cy.clickNextStep();

      // Panel: Dine opplysninger
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      cy.findByRole('textbox', { name: /Fødselsnummer/i }).type('17912099997');
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
        cy.get('dt').eq(1).should('contain.text', 'Etternavn');
        cy.get('dd').eq(1).should('contain.text', 'Nordmann');
      });
    });
  });
});
