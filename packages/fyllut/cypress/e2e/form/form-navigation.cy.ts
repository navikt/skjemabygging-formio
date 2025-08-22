describe('Form navigation', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.visit('/fyllut/cypress101/skjema?sub=paper');
    cy.defaultWaits();
  });

  it('navigation with browser back, and forward buttons', () => {
    cy.findByRole('heading', { name: 'Skjema for Cypress-testing' }).should('exist');
    cy.findByRole('heading', { level: 1, name: 'Veiledning' }).should('exist');

    cy.clickNextStep();
    cy.findByRole('heading', { level: 1, name: 'Dine opplysninger' }).should('exist');

    cy.findByText('Har du norsk fødselsnummer eller D-nummer?').should('exist');
    cy.findByRole('textbox', { name: 'Velg måned' }).should('exist');

    cy.go('back');
    cy.findByRole('heading', { level: 1, name: 'Veiledning' }).should('exist');

    cy.go('forward');
    cy.findByRole('heading', { level: 1, name: 'Dine opplysninger' }).should('exist');
  });
});
