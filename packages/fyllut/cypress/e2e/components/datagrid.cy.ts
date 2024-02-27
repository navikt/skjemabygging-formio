/*
 * Tests datagrid component
 */
describe('Datagrid', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.defaultIntercepts();
    cy.defaultInterceptsMellomlagring();
    cy.mocksRestoreRouteVariants();
  });

  after(() => {
    cy.mocksRestoreRouteVariants();
  });

  describe('Optional fields in datagrid', () => {
    it('does not trigger validation error on optional fields in datagrid rows', () => {
      cy.visit('/fyllut/datagrid123?sub=digital');
      cy.defaultWaits();
      cy.clickStart();
      cy.findByRole('button', { name: 'Legg til' }).click();
      cy.clickSaveAndContinue();
      cy.findByText('For å gå videre må du rette opp følgende:').should('not.exist');
      cy.findByText('Dette er ikke et gyldig kontonummer').should('not.exist');
      cy.findByText('Dette er ikke et gyldig organisasjonsnummer').should('not.exist');
      cy.findByText('Dette er ikke et gyldig fødselsnummer eller D-nummer').should('not.exist');
    });

    it('does not display empty datagrid rows on summary page', () => {
      cy.visit('/fyllut/datagrid123?sub=digital');
      cy.defaultWaits();
      cy.clickStart();
      cy.findByRole('button', { name: 'Legg til' }).click();
      cy.clickSaveAndContinue();
      cy.findByRole('heading', { name: 'Oppsummering' }).should('be.visible');
      cy.get('.data-grid__row').should('not.exist');
    });
  });
});
