/*
 * Tests that the accordion component (react) renders correctly
 */

describe('Accordion', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.visit('/fyllut/accordiontest/veiledning?sub=paper');
    cy.defaultWaits();
  });

  it('should show titles and correct content inside', () => {
    // Normal text
    cy.findAllByRole('button', { name: 'Title1' }).click();
    cy.findByText('Content1').should('be.visible');

    // Bold text
    cy.findAllByRole('button', { name: 'Title2' }).click();
    cy.findByText('Content2').should('be.visible');

    // Link
    cy.findAllByRole('button', { name: 'Title3' }).click();
    cy.findByRole('link', { name: 'Link3' }).should('be.visible');
  });

  it('should have accordion item open if defaultOpen is specified', () => {
    cy.findAllByRole('button', { name: 'DefaultOpen' }).should('be.visible');
    cy.findByText('This is open').should('be.visible');
  });
});
