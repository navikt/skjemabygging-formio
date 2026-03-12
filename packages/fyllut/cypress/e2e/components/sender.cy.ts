describe('Sender', () => {
  describe('Person', () => {
    beforeEach(() => {
      cy.defaultIntercepts();
      cy.visit('/fyllut/sender/person?sub=paper');
      cy.defaultWaits();
    });

    it('renders person fields', () => {
      cy.findByRole('textbox', { name: 'Representantens fødselsnummer eller d-nummer' }).should('exist');
      cy.findByRole('textbox', { name: 'Representantens fornavn' }).should('exist');
      cy.findByRole('textbox', { name: 'Representantens etternavn' }).should('exist');
    });

    it('triggers required error on empty submit', () => {
      cy.clickNextStep();
      cy.get('[data-cy=error-summary]').within(() => {
        cy.findByRole('link', { name: /Representantens fødselsnummer/ }).should('exist');
      });
    });

    it('fills in person fields and shows values on summary page', () => {
      cy.findByRole('textbox', { name: 'Representantens fødselsnummer eller d-nummer' }).type('12345678901');
      cy.findByRole('textbox', { name: 'Representantens fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Representantens etternavn' }).type('Nordmann');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Oppsummering' }).click();

      cy.findByText('12345678901').should('exist');
      cy.findByText('Ola').should('exist');
      cy.findByText('Nordmann').should('exist');
    });
  });

  describe('Organisasjon', () => {
    beforeEach(() => {
      cy.defaultIntercepts();
      cy.visit('/fyllut/sender/organisasjon?sub=paper');
      cy.defaultWaits();
    });

    it('renders organization fields', () => {
      cy.findByRole('textbox', {
        name: 'Organisasjonsnummeret til den virksomheten / underenheten du representerer',
      }).should('exist');
      cy.findByRole('textbox', { name: 'Virksomhetens navn' }).should('exist');
    });

    it('triggers required error on empty submit', () => {
      cy.clickNextStep();
      cy.get('[data-cy=error-summary]').within(() => {
        cy.findByRole('link', { name: /Organisasjonsnummeret/ }).should('exist');
      });
    });

    it('fills in organization fields and shows values on summary page', () => {
      cy.findByRole('textbox', {
        name: 'Organisasjonsnummeret til den virksomheten / underenheten du representerer',
      }).type('123456789');
      cy.findByRole('textbox', { name: 'Virksomhetens navn' }).type('Nav AS');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Oppsummering' }).click();

      cy.findByText('123456789').should('exist');
      cy.findByText('Nav AS').should('exist');
    });
  });
});
