/*
 * Tests that the radio component (react) renders correctly
 */

describe('Radio', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.visit('/fyllut/radiotest/veiledning?sub=paper');
    cy.defaultWaits();
  });

  it('should render simple radio correctly', () => {
    cy.findAllByRole('group', { name: 'Simple' }).within(() => {
      cy.findAllByRole('radio', { name: 'Ja' }).should('exist');
      cy.findAllByRole('radio', { name: 'Nei' }).should('exist');
    });
  });

  it('should render radio with decriptions correctly', () => {
    // Description for each radio option
    cy.findAllByRole('group', { name: 'With description' }).within(() => {
      cy.findAllByRole('radio', { name: 'First This is the first option' }).should('exist');
      cy.findAllByRole('radio', { name: 'Second This is the second option' }).should('exist');
      cy.findAllByRole('radio', { name: 'Third' }).should('exist');
    });

    // Normal and extended description
    cy.findByText('Normal description').should('exist');
    cy.findByRole('button', { name: 'Extended description header' }).should('exist');
    cy.findByRole('button', { name: 'Extended description header' }).click();
    cy.findByText('Extended description').should('exist');
  });
});
