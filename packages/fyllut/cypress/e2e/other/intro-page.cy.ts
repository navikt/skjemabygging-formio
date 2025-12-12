describe('Intro page', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
  });

  describe('Submission type "paper"', () => {
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
      cy.clickIntroPageConfirmation();
      cy.clickStart();
      cy.findByText('Du må bekrefte at du vil svare så riktig som du kan.').should('not.exist');
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Dine opplysninger' }).should('exist');
    });
  });

  describe('Submission type "digitalnologin"', () => {
    it('should display the deadline by which the user must complete the application', () => {
      cy.visit('/fyllut/nologinform/legitimasjon?sub=digitalnologin');
      cy.defaultWaits();
      cy.findByRole('heading', { name: 'Legitimasjon' }).should('exist');

      cy.findByRole('group', { name: 'Hvilken legitimasjon ønsker du å bruke?' }).within(() =>
        cy.findByLabelText('Norsk pass').check(),
      );
      cy.uploadFile('id-billy-bruker.jpg');
      cy.clickNextStep();

      cy.findByRole('heading', { name: /Introduksjon/ }).should('exist');
      cy.findByText(/Du må fullføre innen kl. \d\d\.\d\d/).should('exist');
    });
  });
});
