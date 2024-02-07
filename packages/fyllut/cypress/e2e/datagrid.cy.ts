describe('Datagrid', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.defaultIntercepts();
    cy.defaultInterceptsMellomlagring();
    cy.intercept('GET', '/fyllut/api/forms/datagrid123').as('getForm');
  });

  after(() => {
    cy.mocksRestoreRouteVariants();
  });

  describe('Optional fields in datagrid', () => {
    it('does not trigger validation error on optional fields in datagrid rows', () => {
      cy.visit('/fyllut/datagrid123?sub=digital');
      cy.wait('@getForm');
      cy.clickStart();
      cy.findByRole('button', { name: 'Legg til' }).click();
      cy.clickSaveAndContinue();
      cy.findByText('For å gå videre må du rette opp følgende:').should('not.exist');
      cy.findByText('Dette er ikke et gyldig kontonummer').should('not.exist');
      cy.findByText('Dette er ikke et gyldig organisasjonsnummer').should('not.exist');
    });
  });
});
