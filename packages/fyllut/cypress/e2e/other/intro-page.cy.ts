const privacyLinkText = /hvordan Nav behandler personopplysninger på nav.no/i;

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

    it('should render privacy link in data disclosure and hide standalone privacy section', () => {
      cy.findByRole('button', { name: 'Hvordan vi behandler personopplysninger' }).should('not.exist');
      cy.findByRole('button', { name: 'Informasjon vi henter om deg' }).click();
      cy.contains('Du kan lese mer om').should('exist');
      cy.contains('a', privacyLinkText)
        .should('have.attr', 'href', 'https://www.nav.no/personvernerklaering')
        .and('have.attr', 'target', '_blank');
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
      cy.uploadFile('id-billy-bruker.jpg', { verifyUpload: true });
      cy.clickNextStep();

      cy.findByRole('heading', { name: /Introduksjon/ }).should('exist');
      cy.findByText(/Du må fullføre innen kl. \d\d\.\d\d/).should('exist');
    });
  });
});
