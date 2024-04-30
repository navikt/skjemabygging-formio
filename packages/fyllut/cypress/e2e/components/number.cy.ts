/*
 * Tests that the number component is working as expected
 */

describe('number component', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.visit('/fyllut/testingnumber?sub=paper');
    cy.defaultWaits();
    cy.clickStart();
  });

  describe('happy path', () => {
    it('should render number component', () => {
      cy.findByRole('textbox', { name: 'Tall' }).should('exist').type('50');
      cy.clickNextStep();
      cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');
    });
  });

  describe('errors', () => {
    // Min = 10
    it('should show error for min value', () => {
      cy.findByRole('textbox', { name: 'Tall' }).should('exist').type('9');
      cy.clickNextStep();
      cy.findByRole('link', { name: `Tall kan ikke være mindre enn 10.` }).should('exist');
    });

    // Max = 100
    it('should show error for max value', () => {
      cy.findByRole('textbox', { name: 'Tall' }).should('exist').type('101');
      cy.clickNextStep();
      cy.findByRole('link', { name: `Tall kan ikke være større enn 100.` }).should('exist');
    });
  });
});
