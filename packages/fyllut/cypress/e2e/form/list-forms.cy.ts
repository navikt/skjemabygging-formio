/*
 * Tests the page listing out all forms
 */

describe('Skjemaliste', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.visit('/fyllut');
  });

  it('displays list header', () => {
    cy.findByRole('heading', { name: 'Velg et skjema' }).should('exist');
  });
});
