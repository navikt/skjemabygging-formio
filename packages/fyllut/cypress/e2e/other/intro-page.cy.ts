describe('Submission Type', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Intro page', () => {
    beforeEach(() => {
      cy.visit('/fyllut/intropage?sub=paper');
      cy.defaultWaits();
    });

    it('should show validation error is shown when selfDeclaration is not checked', () => {
      cy.clickStart();
      cy.findByText('Du må bekrefte at du vil svare så riktig som du kan.').should('exist');
      cy.findByRole('link', { name: 'Dine opplysninger' }).should('not.exist');
    });

    it('should render form when selfDeclaration is checked', () => {
      cy.findByRole('checkbox', { name: 'Jeg bekrefter at jeg vil svare så riktig som jeg kan' }).click();
      cy.clickStart();
      cy.findByText('Du må bekrefte at du vil svare så riktig som du kan.').should('not.exist');
      cy.findByRole('link', { name: 'Dine opplysninger' }).should('exist');
    });
  });
});
